import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

const fontPath = 'android/app/src/main/res/font/cabin_variable.ttf';
const licensePath = 'android/app/src/main/res/raw/cabin_ofl.txt';
const font = fs.readFileSync(fontPath);
const license = fs.readFileSync(licensePath);
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
assert.equal(sha256(font), 'a16576e6cec01cf994c46838ed1c17ffdb62cf6da8430edfbcb011f57dd62457');
assert.equal(sha256(license), '965bf33673aec648a3b399185639e502b58e52693d004fc03f6bbdf21b1a0094');
const tables = new Map(Array.from({length:font.readUInt16BE(4)}, (_,index) => {
  const at=12+16*index; return [font.toString('ascii',at,at+4), font.readUInt32BE(at+8)];
}));
const fvar = tables.get('fvar');
assert.ok(fvar, 'approved Cabin must retain its variation table');
const axes = Array.from({length:font.readUInt16BE(fvar+8)}, (_,index) => {
  const at=fvar+font.readUInt16BE(fvar+4)+index*font.readUInt16BE(fvar+10);
  return {tag:font.toString('ascii',at,at+4),min:font.readInt32BE(at+4)/65536,default:font.readInt32BE(at+8)/65536,max:font.readInt32BE(at+12)/65536};
});
assert.deepEqual(axes.find(axis=>axis.tag==='wght'), {tag:'wght',min:400,default:400,max:700});
assert.equal(axes.find(axis=>axis.tag==='wdth').default,100);
const cmap=tables.get('cmap');
const subtables=Array.from({length:font.readUInt16BE(cmap+2)},(_,index)=>cmap+font.readUInt32BE(cmap+4+index*8+4));
function hasGlyph(codepoint) {
  return subtables.some(at=>{
    const format=font.readUInt16BE(at);
    if(format===12){for(let index=0;index<font.readUInt32BE(at+12);index++){const group=at+16+index*12;if(codepoint>=font.readUInt32BE(group)&&codepoint<=font.readUInt32BE(group+4))return true;}}
    if(format===4&&codepoint<=65535){const count=font.readUInt16BE(at+6)/2;for(let index=0;index<count;index++){const end=font.readUInt16BE(at+14+index*2),start=font.readUInt16BE(at+16+count*2+index*2);if(codepoint<start||codepoint>end)continue;const delta=font.readInt16BE(at+16+count*4+index*2),rangeAt=at+16+count*6+index*2,range=font.readUInt16BE(rangeAt);return range===0?((codepoint+delta)&65535)!==0:font.readUInt16BE(rangeAt+range+(codepoint-start)*2)!==0;}}
    return false;
  });
}
assert.ok(hasGlyph('A'.codePointAt(0)));
assert.ok(!hasGlyph('中'.codePointAt(0)) && !hasGlyph('ع'.codePointAt(0)), 'fallback examples must be outside Cabin');
console.log(JSON.stringify({passed:true,fontPath,fontSha256:sha256(font),licensePath,licenseSha256:sha256(license),axes,coverage:{latinA:hasGlyph(65),cjk:hasGlyph(0x4e2d),arabic:hasGlyph(0x639)},source:'Approved master fonts/sources.json; Google Fonts Cabin git blob 27f71b39824edcb34aada65f74f23c65a6cd32e2'},null,2));
