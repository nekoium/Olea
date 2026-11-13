# SPDX-License-Identifier: MIT
"""PTY transport for stock Linux shells. JSON lines only on the parent pipes."""
import codecs
import errno
import fcntl
import json
import os
import pty
import select
import signal
import struct
import sys
import termios
import time


def emit(**record):
    sys.stdout.write(json.dumps(record, ensure_ascii=True) + "\n")
    sys.stdout.flush()


def main():
    pid, master = pty.fork()
    if pid == 0:
        os.environ["TERM"] = "xterm-256color"
        os.execv("/bin/bash", ["bash", "-i"])
    os.set_blocking(master, False)
    os.set_blocking(sys.stdin.fileno(), False)
    incoming = bytearray()
    pending = bytearray()
    decoder = codecs.getincrementaldecoder("utf-8")("replace")
    ended = False
    code = None

    def stopping(_signal, _frame):
        raise SystemExit(0)

    signal.signal(signal.SIGTERM, stopping)
    signal.signal(signal.SIGINT, stopping)
    try:
        fcntl.ioctl(master, termios.TIOCSWINSZ, struct.pack("HHHH", 24, 80, 0, 0))
        emit(type="ready", pid=pid)
        while not ended:
            readable, writable, _ = select.select([master, sys.stdin.fileno()], [master] if pending else [], [], .1)
            if master in writable:
                try:
                    count = os.write(master, pending)
                    del pending[:count]
                except BlockingIOError:
                    pass
            if master in readable:
                try:
                    chunk = os.read(master, 8192)
                    if not chunk:
                        ended = True
                    else:
                        emit(type="output", text=decoder.decode(chunk))
                except OSError as error:
                    if error.errno == errno.EIO:
                        ended = True
                    else:
                        raise
            if sys.stdin.fileno() in readable:
                chunk = os.read(sys.stdin.fileno(), 65536)
                if not chunk:
                    break
                incoming.extend(chunk)
                if len(incoming) > 262144:
                    raise ValueError("terminal_input_limit")
                while b"\n" in incoming:
                    raw, _, remaining = incoming.partition(b"\n")
                    incoming = bytearray(remaining)
                    record = json.loads(raw)
                    if record["type"] == "input":
                        pending.extend(record["text"].encode("utf-8"))
                        if len(pending) > 1048576:
                            raise ValueError("terminal_input_limit")
                    elif record["type"] == "resize":
                        rows, columns = record["rows"], record["columns"]
                        if not (1 <= rows <= 500 and 1 <= columns <= 500):
                            raise ValueError("terminal_invalid_size")
                        fcntl.ioctl(master, termios.TIOCSWINSZ, struct.pack("HHHH", rows, columns, 0, 0))
                    elif record["type"] == "close":
                        ended = True
    finally:
        # Closing the controlling PTY sends SIGHUP; explicit foreground cleanup handles
        # shells that leave a job running. Other workspace terminals have separate PTYs.
        try:
            foreground = os.tcgetpgrp(master)
            if foreground > 0:
                os.killpg(foreground, signal.SIGHUP)
        except OSError:
            pass
        os.close(master)
        try:
            os.kill(pid, signal.SIGHUP)
        except ProcessLookupError:
            pass
        deadline = time.monotonic() + 1
        while time.monotonic() < deadline:
            found, status = os.waitpid(pid, os.WNOHANG)
            if found:
                code = os.waitstatus_to_exitcode(status)
                break
            time.sleep(.02)
        if code is None:
            try:
                os.kill(pid, signal.SIGKILL)
            except ProcessLookupError:
                pass
            _, status = os.waitpid(pid, 0)
            code = os.waitstatus_to_exitcode(status)
        emit(type="exit", code=code)


if __name__ == "__main__":
    try:
        main()
    except Exception:
        # Raw exceptions can contain user input or environment values.
        emit(type="fault", code="terminal_pty_failed")
        sys.exit(1)
