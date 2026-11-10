#!/system/bin/sh
set -eu
/system/bin/sh "$OLEA_APP_BASE/linux.sh" /bin/sh -c '
set -eu
test ! -e /opt/agents/codex
timeout --kill-after=5s 225s npm install --prefix /opt/agents/codex --cache /root/.npm-m2 --fetch-retries=0 --fetch-timeout=45000 --maxsockets=2 --no-audit --no-fund @openai/codex@0.167.0
node --input-type=module -e '\''import{readFileSync,readdirSync,statSync,writeFileSync}from"node:fs";import{resolve,join}from"node:path";import{createHash}from"node:crypto";import{spawnSync}from"node:child_process";const root="/opt/agents/codex/node_modules/@openai/codex";const p=JSON.parse(readFileSync(root+"/package.json"));const entry=resolve(root,typeof p.bin==="string"?p.bin:p.bin.codex);const r=spawnSync(process.execPath,[entry,"--version"],{encoding:"utf8",timeout:30000,maxBuffer:65536});const files=[];function scan(path,depth=0){if(depth>6)return;for(const name of readdirSync(path)){const file=join(path,name),s=statSync(file);if(s.isDirectory())scan(file,depth+1);else if(["package.json","codex.js","codex","bwrap","rg"].includes(name))files.push({path:file,bytes:s.size,sha256:createHash("sha256").update(readFileSync(file)).digest("hex")});}}scan("/opt/agents/codex/node_modules/@openai");const report={version:p.version,license:p.license,entry,files,startup:{status:r.status,stdout:r.stdout,stderr:r.stderr},modelRequests:0};writeFileSync("/workspace/codex-install-a01.json",JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(p.version!=="0.167.0"||r.status!==0)process.exit(1)'\''
'
