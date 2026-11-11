// SPDX-License-Identifier: MIT
// Read-only inspection of local evidence copies; never opens Android's live databases.
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,writeFileSync} from 'node:fs';
const r={at:new Date().toISOString(),thread:'01a1c6d2-bf9b-7670-a6c0-49be86a0f916',databases:[]};
for(const name of ['original-changed','copied-unchanged']){
 const db=new DatabaseSync(`.setup/canonical-diagnosis/${name}-state_5.sqlite`,{readOnly:true});
 const columns=db.prepare('PRAGMA table_info(threads)').all().map(x=>x.name);assert(columns.includes('rollout_path'));
 r.databases.push({name,columns:columns.filter(x=>['id','rollout_path','cwd','cli_version','updated_at'].includes(x)),thread:db.prepare('SELECT id, rollout_path, cwd, cli_version, updated_at FROM threads WHERE id = ?').get(r.thread)});db.close();
}
const old=readFileSync('spike/m4/runtime/evidence/copied-unchanged-rollout.jsonl'),changed=readFileSync('spike/m4/runtime/evidence/original-changed-rollout.jsonl');
r.originalPrefixExactlyUnchanged=changed.subarray(0,old.length).equals(old);r.appendedBytes=changed.length-old.length;
r.appendedRecords=changed.subarray(old.length).toString().trim().split('\n').filter(Boolean).map(JSON.parse);
r.cause='Copied CODEX_HOME SQLite threads.rollout_path retained absolute canonical path; thread/resume selected that original path and appended thread_settings_applied there. Copied JSONL remained unchanged; this was not historical canonical preservation.';
writeFileSync('spike/m4/runtime/evidence/canonical-change-diagnosis-a01.json',JSON.stringify(r,null,2)+'\n',{flag:'wx'});console.log(r);
