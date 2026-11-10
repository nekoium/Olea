#!/system/bin/sh
set -eu
/system/bin/sh "$OLEA_APP_BASE/linux.sh" /bin/sh -c '
set -eu
test ! -e /opt/agents/pi
mkdir -p /opt/agents
timeout --kill-after=5s 225s npm install --prefix /opt/agents/pi --cache /root/.npm-m2 --fetch-retries=0 --fetch-timeout=45000 --maxsockets=2 --no-audit --no-fund @earendil-works/pi-coding-agent@1.5.2
node --input-type=module -e '\''import {readFileSync,writeFileSync} from "node:fs";import {resolve,dirname} from "node:path";import{createHash}from"node:crypto";import{spawnSync}from"node:child_process";const root="/opt/agents/pi/node_modules/@earendil-works/pi-coding-agent";const p=JSON.parse(readFileSync(root+"/package.json"));const entry=resolve(root,typeof p.bin==="string"?p.bin:p.bin.pi);const r=spawnSync(process.execPath,[entry,"--version"],{encoding:"utf8",timeout:30000,maxBuffer:65536});const report={version:p.version,license:p.license,entry,entrySha256:createHash("sha256").update(readFileSync(entry)).digest("hex"),manifestSha256:createHash("sha256").update(readFileSync(root+"/package.json")).digest("hex"),lockSha256:createHash("sha256").update(readFileSync("/opt/agents/pi/package-lock.json")).digest("hex"),startup:{status:r.status,stdout:r.stdout,stderr:r.stderr},modelRequests:0};writeFileSync("/workspace/pi-install-a01.json",JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(p.version!=="1.5.2"||r.status!==0)process.exit(1)'\''
'
