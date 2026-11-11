// SPDX-License-Identifier: MIT
// No execution on import. Allocate only categories with their own direct prerequisites.
export function groupedPhoneTools(categories = ['intent-url','structured-api','files-media','notification']) {
  if(!Array.isArray(categories)||!categories.length||new Set(categories).size!==categories.length||categories.some(c=>!['intent-url','structured-api','files-media','notification','capture'].includes(c)))throw Error('invalid_phone_categories');
  return ['phone_capabilities',...categories.flatMap(c=>({'intent-url':['phone_open_url'],'structured-api':['phone_location'],'files-media':['phone_files_write_read'],notification:['phone_fixture_notify','phone_notifications'],capture:['phone_capture_request','phone_capture_result']}[c]))];
}
export function groupedPhonePrompt(options) {
  if(options.allocatedPrompts!==1||!options.allocationId||!options.directReceipt||!['pi','codex'].includes(options.agent))throw Error('explicit_allocation_and_direct_prerequisites_required');
  const categories=options.categories??['intent-url','structured-api','files-media','notification'];
  const tools=groupedPhoneTools(categories);
  if(categories.includes('intent-url')&&!/^https:\/\//.test(options.url))throw Error('invalid_bounded_fixture');
  if(categories.includes('files-media')&&(typeof options.fileValue!=='string'||options.fileValue.length>128))throw Error('invalid_bounded_fixture');
  const operations=categories.map(c=>({capture:'Request fresh one-app screen consent with phone_capture_request once, then call phone_capture_result once. The authorized test observer traverses actual Android consent and verifies the fresh image; wait for that result and never retry the request.','intent-url':`Open ${JSON.stringify(options.url)} with phone_open_url once.`, 'structured-api':'Read phone_location once and report its last-known age and coordinates.', 'files-media':`Create/read ${JSON.stringify(options.fileValue)} using phone_files_write_read once in the already user-selected folder.`,notification:'Call phone_fixture_notify once, then phone_notifications once and report the separate fixture package/id/text.'}[c])).join(' ');
  return `Perform one bounded phone-category workflow with registered phone tools only. Read phone_capabilities; stop on any denied prerequisite. ${operations} Use only these phone tools: ${tools.join(', ')}. ${categories.includes('capture')?'Do not request folder consent':'Do not request folder/screen-capture consent'}, change permissions, inspect private files, read oracle state, or use shell/ADB to control Android. Capture image input is not supplied; do not claim visual capture interpretation. Record factual results only. At most${tools.length}phone calls; no retry or replay after uncertain delivery. Operator selected stock full access/approval never for Codex; Kotlin remains phone permission authority. Finish after these operations.`;
}
