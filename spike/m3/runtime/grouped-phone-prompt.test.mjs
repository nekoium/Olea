// SPDX-License-Identifier: MIT
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {groupedPhonePrompt} from './grouped-phone-prompt.mjs';
const valid={allocatedPrompts:1,allocationId:'fixture-only',directReceipt:'fixture-pass.json',agent:'pi',url:'https://example.org/',fileValue:'fixture'};
test('grouped prompt requires allocation and direct prerequisites before provider work',()=>{
 for(const options of [{...valid,allocatedPrompts:0},{...valid,allocationId:''},{...valid,directReceipt:''},{...valid,agent:'unknown'}])assert.throws(()=>groupedPhonePrompt(options));
});
test('grouped prompt bounds fixture inputs and avoids a capture-image claim',()=>{
 assert.throws(()=>groupedPhonePrompt({...valid,url:'http://example.org/'}));
 assert.throws(()=>groupedPhonePrompt({...valid,fileValue:'x'.repeat(129)}));
 for(const agent of ['pi','codex']){
  const prompt=groupedPhonePrompt({...valid,agent});
  for(const tool of ['phone_open_url','phone_location','phone_files_write_read','phone_fixture_notify','phone_notifications'])assert(prompt.includes(tool));
  assert(prompt.includes('Capture image input is not supplied'));assert(prompt.includes('no retry or replay'));
 }
});
