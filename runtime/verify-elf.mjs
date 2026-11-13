#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// Check ELF class, endianness and machine without executing downloaded binaries.
import { open } from 'node:fs/promises';
const [abi, ...files] = process.argv.slice(2);
const formats = { 'arm64-v8a': [2, 183], x86_64: [2, 62], arm: [1, 40], x86: [1, 3] };
if (!formats[abi] || !files.length) throw Error('Usage: node verify-elf.mjs ABI file...');
for (const file of files) {
  const handle = await open(file, 'r');
  const header = Buffer.alloc(20);
  try { await handle.read(header, 0, 20, 0); } finally { await handle.close(); }
  const [elfClass, machine] = formats[abi];
  if (header.subarray(0, 4).toString('hex') !== '7f454c46' || header[4] !== elfClass || header[5] !== 1 || header.readUInt16LE(18) !== machine) {
    throw Error(`ELF ABI mismatch: ${file}; expected ${abi}`);
  }
  console.log(`ELF ${abi}: ${file}`);
}
