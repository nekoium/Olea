// SPDX-License-Identifier: MIT
import { lstat, realpath, symlink } from 'node:fs/promises';

/** Share upstream login refreshes while retaining each conversation's canonical home/history. */
export async function linkUpstreamAuth(source: string | undefined, destination: string) {
  if (!source) return;
  try { await lstat(destination); return; }
  catch (error: any) { if (error.code !== 'ENOENT') throw new Error('agent_auth_unavailable'); }
  let path: string;
  try {
    path = await realpath(source);
    if (!(await lstat(path)).isFile()) throw new Error('agent_auth_unavailable');
  } catch (error: any) { if (error.code === 'ENOENT') return; throw new Error('agent_auth_unavailable'); }
  try { await symlink(path, destination); }
  catch (error: any) { if (error.code !== 'EEXIST') throw new Error('agent_auth_unavailable'); }
}
