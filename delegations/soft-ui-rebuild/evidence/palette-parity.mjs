import fs from 'node:fs';
import assert from 'node:assert/strict';

const spec = JSON.parse(fs.readFileSync('docs/ui/soft/palettes.json', 'utf8'));
const source = fs.readFileSync('android/app/src/main/java/dev/olea/app/SoftTheme.kt', 'utf8');
const matches = [...source.matchAll(/SoftPalette\("([^"]+)", "([^"]+)", "([^"]+)", Color\(0xff([a-f0-9]+)\),\s*roles\("([^"]+)", false\),\s*roles\("([^"]+)", true\)\)/g)];
assert.equal(matches.length, 6);
const order = ['bg','paper','ink','muted','line','accent','soft','keyboard','terminal-bg','terminal-ink','terminal-accent','terminal-muted','terminal-keys','terminal-notice'];
for (const [, id, name, description, swatch, light, dark] of matches) {
  const palette = spec.palettes[id];
  assert.ok(palette, id);
  assert.equal(name, palette.name);
  assert.equal(description, palette.description);
  assert.equal('#'+swatch, palette.swatch);
  for (const [theme, values] of [['light',light],['dark',dark]]) {
    assert.deepEqual(Object.fromEntries(values.split(' ').map((color, index) => [order[index], '#'+color])), palette[theme], `${id}/${theme}`);
  }
}
for (const state of Object.values(spec.sharedStateColors)) for (const color of Object.values(state)) assert.ok(source.includes('0xff'+color.slice(1)), color);
assert.match(source, /firstOrNull \{ it.id == id \} \?: softPalettes.first\(\)/);
assert.equal(matches[0][1], spec.defaultPalette);
console.log('PASS: all 168 palette roles, six names/swatches, shared semantic colors, default and unknown-ID fallback match the approved contract.');
