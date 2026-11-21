import React, {useEffect,useRef,useState} from 'react';
import {cardStatuses} from './cards.js';

export default function InlineCard({card,view,onUpdate,onClose,focusField}) {
  const record = card.customData.record;
  const [draft,setDraft] = useState(record);
  const titleInput = useRef(null);
  useEffect(() => setDraft(record),[record]);
  useEffect(() => {
    titleInput.current.style.height='0px';
    titleInput.current.style.height=`${Math.min(titleInput.current.scrollHeight,54)}px`;
  },[draft.title]);
  const zoom = view.zoom.value;
  const left = (card.x+view.scrollX)*zoom+view.offsetLeft;
  const top = (card.y+view.scrollY)*zoom+view.offsetTop;
  function update(fields) {
    const next = {...draft,...fields}; setDraft(next);
    if (next.link) {
      try {if (!['http:','https:'].includes(new URL(next.link).protocol)) return;}
      catch {return;}
    }
    onUpdate(next);
  }
  return <div className="inline-card-position" style={{left,top,width:card.width*zoom,height:card.height*zoom,transform:`rotate(${card.angle}rad)`}}>
    <article className={`inline-card ${draft.kind === 'note' ? 'inline-note' : 'inline-task'}`} data-status={draft.status}
      aria-label="Edit card on canvas" style={{width:card.width,height:card.height,transform:`scale(${zoom})`}}
      onKeyDown={event=>{event.stopPropagation();if(event.key==='Escape'){event.preventDefault();onClose();}}}>
      <div className="inline-card-meta">
        {draft.kind === 'note' ? <span>Note</span> : <select aria-label="Task status" value={draft.status || 'To do'} onChange={event=>update({status:event.target.value})}>
          {cardStatuses.map(status=><option key={status}>{status}</option>)}
        </select>}
        {draft.link?.match(/\/issues\/(\d+)/)?.[1] && <span>#{draft.link.match(/\/issues\/(\d+)/)[1]}</span>}
      </div>
      <textarea ref={titleInput} className="inline-card-title" aria-label="Card title" rows={1} value={draft.title}
        placeholder={draft.kind === 'note' ? 'Untitled note' : 'Untitled task'} maxLength={180} autoFocus={focusField === 'title'}
        onFocus={event=>{if(/^Untitled (note|task)$/.test(event.target.value)) event.target.select();}}
        onChange={event=>update({title:event.target.value})}/>
      <textarea className="inline-card-content" aria-label="Card content" value={draft.notes || ''}
        placeholder="Write here…" maxLength={12000} autoFocus={focusField !== 'title'} onChange={event=>update({notes:event.target.value})}/>
      <div className="inline-card-reference">
        <input aria-label="Reference link" type="url" value={draft.link || ''} placeholder="Add a link…" onChange={event=>update({link:event.target.value})}/>
        {record.link && <a href={record.link} target="_blank" rel="noreferrer">Open</a>}
      </div>
    </article>
  </div>;
}
