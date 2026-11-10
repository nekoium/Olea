#!/usr/bin/env node
// Original source MIT. Extract only the data archive from a verified Debian ar file.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
const [source, expectedHash, destination] = process.argv.slice(2);
if (!source || !/^[0-9a-f]{64}$/.test(expectedHash ?? '') || !destination) throw Error('Usage: node extract-deb.mjs file.deb sha256 destination');
const data = await readFile(source);
if (createHash('sha256').update(data).digest('hex') !== expectedHash) throw Error('SHA256 mismatch');
if (data.subarray(0, 8).toString() !== '!<arch>\n') throw Error('Invalid ar signature');
await mkdir(destination, { recursive: true });
let found = false;
for (let offset = 8; offset + 60 <= data.length;) {
  const header = data.subarray(offset, offset + 60).toString('ascii');
  const name = header.slice(0, 16).trim().replace(/\/$/, '');
  const length = Number(header.slice(48, 58).trim());
  if (!Number.isSafeInteger(length) || length < 0 || offset + 60 + length > data.length || header.slice(58) !== '`\n') throw Error('Invalid ar member');
  if (/^data\.tar\.(xz|gz|zst)$/.test(name)) {
    await writeFile(path.join(destination, name), data.subarray(offset + 60, offset + 60 + length));
    console.log(path.join(destination, name)); found = true;
  }
  offset += 60 + length + length % 2;
}
if (!found) throw Error('Missing data archive');
