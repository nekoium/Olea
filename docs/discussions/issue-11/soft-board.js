(()=>{
'use strict';
const flow=window.OLEA_SOFT_FLOW,v=document.getElementById('viewport'),world=document.getElementById('world'),modal=document.getElementById('walk'),frame=document.getElementById('walk-frame'),key='olea-soft-review-v1';
let z=.5,x=30,y=30,drag=null,dark=false,active='',walkGroup=null,notes={};try{notes=JSON.parse(localStorage.getItem(key)||'{}')}catch{}
const cards=[],rows=[];const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n};
const specimenUrl=id=>'mood-prototypes.html?screen='+encodeURIComponent(id)+(dark?'&dark=1':'');
for(const [i,g] of flow.groups.entries()){
 const top=60+i*845;rows.push({...g,top});const label=el('section','group-label');label.style.left='70px';label.style.top=top+'px';label.append(el('h2','',g.title),el('p','',g.note));const walk=el('button','journey-action','Walk this journey ↗');walk.onclick=()=>open(g.screens[0],g);label.append(walk);world.append(label);
 const button=el('button','',g.title);button.dataset.group=g.id;button.append(el('span','group-count',String(g.screens.length)));button.onclick=()=>focus(g.id);document.getElementById('groups').append(button);
 for(const [j,id]of g.screens.entries()){
  const s=flow.screens[id],node=el('article','specimen-card');node.dataset.screen=id;node.tabIndex=0;node.setAttribute('aria-label','Open '+s.title);const cx=70+j*320,cy=top+118;node.style.left=cx+'px';node.style.top=cy+'px';
  const head=el('div','specimen-top');head.append(el('span','',String(cards.length+1).padStart(2,'0')),el('h3','',s.title));head.append(el('button','','↗'));
  const host=el('div','specimen-window'),iframe=el('iframe');iframe.title=s.title+' — Soft design proposal';iframe.dataset.src=specimenUrl(id);host.append(iframe);
  const bottom=el('div','specimen-bottom');bottom.append(el('span','','PROPOSED SCREEN'),el('span','',notes[id]?'NOTE':'OPEN TO EXPLORE'));node.append(head,host,bottom);node.onclick=()=>open(id,g);node.onkeydown=e=>{if(e.key==='Enter')open(id,g)};world.append(node);cards.push({id,node,iframe,x:cx,y:cy,group:g.id});
 }
}
document.getElementById('count').textContent=cards.length+' states · '+flow.groups.length+' journeys';
function loadGroup(id){for(const c of cards.filter(c=>c.group===id))if(!c.iframe.src)c.iframe.src=specimenUrl(c.id)}
function render(){world.style.transform=`translate(${x}px,${y}px) scale(${z})`;document.getElementById('zoom').textContent=Math.round(z*100)+'%';v.style.backgroundPosition=`${x}px ${y}px`;v.style.backgroundSize=`${22*z}px ${22*z}px`;for(const r of rows)if((r.top+800)*z+y>0&&r.top*z+y<v.clientHeight)loadGroup(r.id)}
function focus(id){const row=rows.find(r=>r.id===id);z=Math.min(.95,(v.clientWidth-85)/(row.screens.length*320-60),(v.clientHeight-90)/800);z=Math.max(.1,z);x=(v.clientWidth-(row.screens.length*320-60)*z)/2-70*z;y=28-row.top*z;document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.group===id));loadGroup(id);render()}
function zoom(value,cx=v.clientWidth/2,cy=v.clientHeight/2){value=Math.max(.08,Math.min(2.5,value));x=cx-(cx-x)*value/z;y=cy-(cy-y)*value/z;z=value;render()}
v.addEventListener('wheel',e=>{e.preventDefault();const r=v.getBoundingClientRect();zoom(z*Math.exp(-Math.max(-180,Math.min(180,e.deltaY))*.002),e.clientX-r.left,e.clientY-r.top)},{passive:false});
v.onpointerdown=e=>{if(e.target.closest('.specimen-card,button'))return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,oldX:x,oldY:y};v.setPointerCapture(e.pointerId);v.classList.add('dragging')};v.onpointermove=e=>{if(drag){x=drag.oldX+e.clientX-drag.x;y=drag.oldY+e.clientY-drag.y;render()}};v.onpointerup=v.onpointercancel=()=>{drag=null;v.classList.remove('dragging')};
function metadata(id){active=id;const s=flow.screens[id],group=flow.groups.find(g=>g.screens.includes(id));if(group&&!walkGroup.screens.includes(id))walkGroup=group;document.getElementById('screen-title').textContent=s.title;document.getElementById('screen-position').textContent='Soft / '+(group?.title||'Preview')+' / '+(dark?'Dark':'Light');document.getElementById('journey-title').textContent=walkGroup.title;document.getElementById('screen-note').textContent=s.note;document.getElementById('design-note').value=notes[id]||'';const index=walkGroup.screens.indexOf(id);document.getElementById('previous').disabled=index<=0;document.getElementById('next').disabled=index===walkGroup.screens.length-1;}
function open(id,group){walkGroup=group||flow.groups.find(g=>g.screens.includes(id));metadata(id);frame.src=specimenUrl(id);modal.showModal()}
function goto(id){metadata(id);frame.src=specimenUrl(id)}
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==frame.contentWindow||e.data?.type!=='olea-soft-screen'||!flow.screens[e.data.id])return;metadata(e.data.id)});
document.getElementById('previous').onclick=()=>{const i=walkGroup.screens.indexOf(active);if(i>0)goto(walkGroup.screens[i-1])};document.getElementById('next').onclick=()=>{const i=walkGroup.screens.indexOf(active);if(i<walkGroup.screens.length-1)goto(walkGroup.screens[i+1])};document.getElementById('restart').onclick=()=>goto(walkGroup.screens[0]);
document.getElementById('design-note').oninput=e=>{notes[active]=e.target.value;try{localStorage.setItem(key,JSON.stringify(notes))}catch{}const c=cards.find(c=>c.id===active);if(c)c.node.querySelector('.specimen-bottom span:last-child').textContent=notes[active]?'NOTE':'OPEN TO EXPLORE'};
document.getElementById('export').onclick=()=>{const blob=new Blob([JSON.stringify({direction:'Soft',status:'USER DECISION: visual direction; detailed screens AGENT PLAN',notes},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download='olea-soft-design-notes.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
document.getElementById('close-walk').onclick=()=>modal.close();document.getElementById('scope').onclick=()=>document.getElementById('design-status').showModal();document.getElementById('close-status').onclick=()=>document.getElementById('design-status').close();document.getElementById('in').onclick=()=>zoom(z*1.25);document.getElementById('out').onclick=()=>zoom(z*.8);document.getElementById('start').onclick=()=>open('welcome',flow.groups[0]);
document.getElementById('fit').onclick=()=>{z=Math.min((v.clientWidth-70)/2300,(v.clientHeight-90)/(rows.length*845));x=25;y=25;render()};
document.getElementById('theme').onclick=e=>{dark=!dark;e.target.textContent=dark?'Light preview':'Dark preview';for(const c of cards)if(c.iframe.src)c.iframe.contentWindow.postMessage({type:'olea-soft-theme',dark},location.origin);if(modal.open){frame.contentWindow.postMessage({type:'olea-soft-theme',dark},location.origin);metadata(active)}};
window.addEventListener('keydown',e=>{if(modal.open||document.querySelector('dialog[open]')||['INPUT','TEXTAREA'].includes(e.target.tagName))return;const m={ArrowLeft:[70,0],ArrowRight:[-70,0],ArrowUp:[0,70],ArrowDown:[0,-70]}[e.key];if(m){e.preventDefault();x+=m[0];y+=m[1];render()}});
window.addEventListener('resize',render);focus('work');
})();
