import { convertToExcalidrawElements } from '@excalidraw/excalidraw';

const statuses = {
  'To do':{ink:'#626f61',fill:'#edf0e9'},
  'In progress':{ink:'#35658a',fill:'#e8f0f6'},
  'Discuss':{ink:'#8b6528',fill:'#f6f0e2'},
  'Done':{ink:'#477144',fill:'#eaf2e6'},
  'Later':{ink:'#777b73',fill:'#eeefec'},
};
const measure = document.createElement('canvas').getContext('2d');
function lines(text,width,size,max) {
  measure.font = `${size}px Arial`;
  const result = [];
  for (const paragraph of text.split('\n')) {
    let line = '';
    for (const word of paragraph.split(' ')) {
      if (line && measure.measureText(`${line} ${word}`).width > width) { result.push(line); line = ''; }
      // Long URLs and unbroken text also stay inside the card.
      for (const char of (line ? ' ' : '') + word) {
        if (line && measure.measureText(line + char).width > width) { result.push(line); line = ''; }
        line += char;
      }
    }
    result.push(line);
  }
  if (result.length > max) {result.length = max;result[max-1] = result[max-1].replace(/.{0,3}$/,'')+'…';}
  return result.join('\n');
}

export function cardElements(card) {
  card = {...card,kind:card.kind === 'note' ? 'note' : 'task'};
  const task = card.kind !== 'note', id = card.id || crypto.randomUUID();
  const x = card.x, y = card.y, width = Math.max(220,card.width || 288), height = Math.max(220,card.height || 304);
  const pad = 20, contentWidth = width-pad*2;
  const style = statuses[card.status] || statuses['To do'];
  const skeleton = [];
  const add = (name,props) => skeleton.push({id:`${id}:${name}`,groupIds:[id],roughness:0,strokeWidth:1,strokeColor:'transparent',...props,
    customData:{oleaCardId:id,...props.customData}});
  add('surface',{type:'rectangle',x,y,width,height,strokeWidth:1,strokeColor:task ? '#cfd8c7' : '#b6c9a5',
    backgroundColor:task ? '#ffffff' : '#eaf0e2',fillStyle:'solid',roundness:{type:3,value:10},
    customData:{oleaKind:task ? 'task' : 'note',record:{...card,id,width,height}}});
  if (task) {
    measure.font='12px Arial';
    const badgeWidth = Math.ceil(measure.measureText(card.status || 'To do').width)+38;
    add('badge',{type:'rectangle',x:x+pad,y:y+pad,width:badgeWidth,height:24,backgroundColor:style.fill,fillStyle:'solid',roundness:{type:3,value:12}});
    add('dot',{type:'ellipse',x:x+pad+9,y:y+pad+9,width:6,height:6,backgroundColor:style.ink,fillStyle:'solid'});
    add('status',{type:'text',x:x+pad+21,y:y+pad+5,text:card.status || 'To do',fontFamily:2,fontSize:12,lineHeight:1.2,strokeColor:style.ink});
    const issue = card.link?.match(/\/issues\/(\d+)/)?.[1];
    if (issue) add('issue',{type:'text',x:x+width-pad-40,y:y+pad+5,text:`#${issue}`,fontFamily:2,fontSize:12,strokeColor:'#788573'});
  } else {
    add('note-label',{type:'text',x:x+pad,y:y+pad,text:'Note',fontFamily:2,fontSize:12,strokeColor:'#668052'});
  }
  const titleY = y+pad+(task ? 43 : 34);
  const title = lines(card.title || (task ? 'Untitled task' : 'Untitled note'),contentWidth,21,2);
  add('title',{type:'text',x:x+pad,y:titleY,text:title,fontFamily:2,fontSize:21,lineHeight:1.25,strokeColor:'#25351e'});
  const bodyY = titleY+title.split('\n').length*26+16;
  const bodyLines = Math.max(1,Math.floor((y+height-50-bodyY)/20));
  if (card.notes) add('body',{type:'text',x:x+pad,y:bodyY,text:lines(card.notes,contentWidth,14,bodyLines),fontFamily:2,fontSize:14,lineHeight:1.45,strokeColor:'#586650'});
  if (card.link) add('footer',{type:'text',x:x+pad,y:y+height-32,text:'Reference',fontFamily:2,fontSize:12,strokeColor:'#708063'});
  const elements = convertToExcalidrawElements(skeleton,{regenerateIds:false});
  const angle = card.angle || 0;
  if (!angle) return elements;
  const cx=x+width/2,cy=y+height/2;
  return elements.map(element => {
    const dx=element.x+element.width/2-cx,dy=element.y+element.height/2-cy;
    return {...element,angle,x:cx+dx*Math.cos(angle)-dy*Math.sin(angle)-element.width/2,
      y:cy+dx*Math.sin(angle)+dy*Math.cos(angle)-element.height/2};
  });
}

export const cardStatuses = Object.keys(statuses);
