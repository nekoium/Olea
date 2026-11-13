// SPDX-License-Identifier: MIT
import { createInterface } from 'node:readline';
const emit = value => process.stdout.write(JSON.stringify(value) + '\n');
emit({ type: 'ready', pid: process.pid });
createInterface({ input: process.stdin }).on('line', line => {
  const record = JSON.parse(line);
  if (record.type === 'input') emit({ type: 'output', text: record.text });
  if (record.type === 'resize') emit({ type: 'output', text: `${record.columns}x${record.rows}` });
}).on('close', () => process.exit());
