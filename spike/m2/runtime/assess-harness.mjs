// Original MIT. Assert actual native timeout, inherited-pipe and UTF-8 byte-cap receipts.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
const root = 'spike/m2/runtime/evidence/';
const load = name => { const bytes = readFileSync(`${root}${name}.json`); assert(bytes.length < 1024 * 1024); return JSON.parse(bytes); };
const timeout = load('timeout-check-a01');
assert.equal(timeout.timedOut, true); assert.equal(timeout.deadlineSeconds, 5); assert.equal(timeout.rootExitObserved, true);
assert.equal(timeout.drainersStillAlive, false); assert.equal(timeout.stdoutDrainFault, 'InterruptedIOException');
const utf8 = load('utf8-drain-a01');
assert.equal(utf8.hostPid, timeout.hostPid); assert.equal(utf8.exitCode, 0); assert.equal(utf8.stdoutObservedBytes, 90000);
assert(utf8.stderrObservedBytes >= 80000); assert.equal(utf8.stdoutRetainedBytes, 65536); assert.equal(utf8.stderrRetainedBytes, 65536);
assert.equal(utf8.outputTruncated, true); assert.equal(utf8.drainersStillAlive, false);
const pipes = load('inherited-pipe-a01');
assert.equal(pipes.hostPid, timeout.hostPid); assert.equal(pipes.exitCode, 0); assert.equal(pipes.rootExitObserved, true);
assert(pipes.endedAtMs - pipes.startedAtMs < 10000);
const summary = { status: 'pass', timeoutCaughtWithoutAppCrash: true, sameNativeHostPid: timeout.hostPid, utf8ByteBounds: { stdoutObserved: utf8.stdoutObservedBytes, stderrObserved: utf8.stderrObservedBytes, perStreamRetained: 65536 }, inheritedPipes: { boundedMs: pipes.endedAtMs - pipes.startedAtMs, observedAfterJoin: pipes.inheritedPipesAfterJoin, drainersStillAlive: pipes.drainersStillAlive }, limits: ['Root-only timeout signaling; no generic descendant cleanup proof', '8-second fixture child absence requires separate identity observation', 'No model/provider calls'] };
writeFileSync(`${root}harness-assertions.json`, JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify(summary));
