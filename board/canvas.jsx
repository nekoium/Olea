import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Excalidraw, MainMenu, CaptureUpdateAction,
  serializeAsJSON, viewportCoordsToSceneCoords,
} from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import './canvas.css';
import './seed.js';
import {cardElements} from './cards.js';
import InlineCard from './InlineCard.jsx';

const storageKey = 'olea-canvas-v2';
const legacyKey = 'olea-project-board-v1';
const migrationBackupKey = 'olea-canvas-before-inline-v1';
const libraryKey = 'olea-canvas-library-v1';
const defaults = {
  viewBackgroundColor:'#f7f8f5', currentItemStrokeColor:'#283524',
  currentItemBackgroundColor:'transparent', currentItemFillStyle:'solid',
  currentItemRoughness:0, currentItemFontFamily:2, currentItemFontSize:20,
  currentItemStrokeWidth:2, currentItemRoundness:'round',
  scrollX:40, scrollY:100, zoom:{value:.85}, name:'Olea canvas',
};

function legacyScene(data) {
  if (data?.version !== 1 || !Array.isArray(data.tasks) || data.tasks.length > 5000) throw Error('This is not an Olea board backup.');
  for (const card of data.tasks) {
    if (!card || !Number.isFinite(card.x) || !Number.isFinite(card.y) ||
        typeof card.title !== 'string' || typeof card.notes !== 'string') throw Error('The board contains an invalid card.');
    if (card.link) {
      const link = new URL(card.link);
      if (!['http:', 'https:'].includes(link.protocol)) throw Error('The board contains an invalid reference link.');
    }
  }
  return {elements:data.tasks.flatMap(cardElements), appState:{...defaults}, files:{}};
}

function pendingLegacy() {
  const params = new URLSearchParams(location.hash.slice(1));
  if (!params.has('olea-board')) return null;
  const data = JSON.parse(params.get('olea-board'));
  // Check the contents before removing the migration link from the address bar.
  legacyScene(data);
  history.replaceState(null, '', location.pathname + location.search);
  return data;
}

function readInitial() {
  try {
    const incoming = pendingLegacy();
    const saved = localStorage.getItem(storageKey);
    const libraryItems = JSON.parse(localStorage.getItem(libraryKey) || '[]');
    if (saved) {
      const scene = JSON.parse(saved);
      if (!Array.isArray(scene.elements)) throw Error('Saved canvas is invalid.');
      const oldCards = scene.elements.filter(element => !element.isDeleted && element.customData?.legacyRecord);
      if (oldCards.length || scene.elements.some(element => (element.customData?.oleaCardId || element.customData?.oleaKind) && element.link)) {
        if (!localStorage.getItem(migrationBackupKey)) localStorage.setItem(migrationBackupKey,saved);
        const savedElements = scene.elements;
        const obsolete = new Set(oldCards.flatMap(element => [element.id,...(element.boundElements || []).map(bound => bound.id)]));
        scene.elements = scene.elements.filter(element => !obsolete.has(element.id)).map(element => element.customData?.oleaCardId ? {...element,link:null} : element);
        for (const element of oldCards) {
          const record = {...element.customData.legacyRecord,x:element.x,y:element.y};
          const text = savedElements.find(item => item.id === element.boundElements?.find(bound=>bound.type==='text')?.id);
          if (text?.originalText) {
            const parts = text.originalText.split('\n\n');
            if (parts[0] === record.status) parts.shift();
            record.title = parts.shift() || record.title;record.notes = parts.join('\n\n');
          }
          scene.elements.push(...cardElements(record));
        }
      }
      return {scene:{...scene,appState:{...defaults,...scene.appState},libraryItems}, incoming, blocked:false};
    }
    const legacy = incoming || JSON.parse(localStorage.getItem(legacyKey) || 'null');
    return {scene:{...legacyScene(legacy || {version:1,tasks:window.OLEA_SEED}),libraryItems}, blocked:false};
  } catch (error) {
    // Leave unreadable storage untouched and allow the user to export a recovery drawing.
    return {scene:{elements:[],appState:defaults,files:{}}, blocked:true,
      error:`Could not load saved canvas: ${error.message}. Existing saved data has been preserved.`};
  }
}
const initial = readInitial();

function App() {
  const [api, setApi] = useState(null);
  const [preset, setPreset] = useState(null);
  const [notice, setNotice] = useState(initial.error || '');
  const [incoming, setIncoming] = useState(initial.incoming);
  const [activeCard,setActiveCard] = useState(null);
  const [editingCardId,setEditingCardId] = useState(null);
  const [focusField,setFocusField] = useState('body');
  const [canvasView,setCanvasView] = useState(initial.scene.appState || defaults);
  const host = useRef(null), preview = useRef(null), fileInput = useRef(null);
  const timer = useRef(null), pending = useRef(null), blocked = useRef(initial.blocked);
  const lastSaved = useRef('');

  const flush = useCallback(() => {
    clearTimeout(timer.current);
    if (!pending.current || blocked.current) return;
    try {
      const {elements, state, files} = pending.current;
      const scene = JSON.parse(serializeAsJSON(elements, state, files, 'local'));
      for (const key of [...Object.keys(defaults),'theme','gridSize','gridModeEnabled','objectsSnapModeEnabled']) scene.appState[key] = state[key];
      const serialized = JSON.stringify(scene);
      if (serialized !== lastSaved.current) {
        localStorage.setItem(storageKey, serialized);
        lastSaved.current = serialized;
      }
    } catch (error) {
      setNotice(`Autosave failed: ${error.message}. Use the menu to save a copy to your computer.`);
    }
  }, []);

  const onChange = useCallback((elements, state, files) => {
    if (state.activeTool.type !== 'selection') setPreset(null);
    const chosen = elements.filter(element => !element.isDeleted && state.selectedElementIds[element.id]);
    const groupId = chosen[0]?.customData?.oleaCardId;
    const card = groupId && chosen.every(element => element.customData?.oleaCardId === groupId)
      ? elements.find(element => !element.isDeleted && element.customData?.oleaKind && element.customData?.oleaCardId === groupId) : null;
    setActiveCard(previous => previous === card ? previous : card || null);
    setCanvasView(previous => previous.scrollX === state.scrollX && previous.scrollY === state.scrollY && previous.zoom.value === state.zoom.value
      && previous.offsetLeft === state.offsetLeft && previous.offsetTop === state.offsetTop ? previous : state);
    pending.current = {elements,state,files};
    clearTimeout(timer.current);
    timer.current = setTimeout(flush, 500);
  }, [flush]);

  const saveLibrary = useCallback(items => {
    if (blocked.current) return;
    try { localStorage.setItem(libraryKey,JSON.stringify(items)); }
    catch { setNotice('Could not save the library. Save your drawing to a file before closing.'); }
  }, []);

  useEffect(() => {
    const saveWhenHidden = () => { if (document.hidden) flush(); };
    window.addEventListener('pagehide',flush);
    document.addEventListener('visibilitychange',saveWhenHidden);
    return () => {
      flush(); window.removeEventListener('pagehide',flush);
      document.removeEventListener('visibilitychange',saveWhenHidden);
    };
  }, [flush]);

  // Keep the requested wheel-to-zoom input while Excalidraw handles the other gestures.
  useEffect(() => {
    if (!api) return;
    const zoom = event => {
      if (event.target.tagName !== 'CANVAS') return;
      event.preventDefault(); event.stopPropagation();
      const state = api.getAppState();
      const at = viewportCoordsToSceneCoords({clientX:event.clientX,clientY:event.clientY},state);
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
      const value = Math.max(.1,Math.min(4,state.zoom.value * Math.exp(-Math.max(-240,Math.min(240,delta))*.002)));
      api.updateScene({appState:{zoom:{value},
        scrollX:(event.clientX-state.offsetLeft)/value-at.x,
        scrollY:(event.clientY-state.offsetTop)/value-at.y},captureUpdate:CaptureUpdateAction.NEVER});
    };
    const node = host.current;
    node.addEventListener('wheel',zoom,{capture:true,passive:false});
    return () => node.removeEventListener('wheel',zoom,true);
  }, [api]);

  useEffect(() => {
    const escape = event => { if (event.key === 'Escape') {setPreset(null);setEditingCardId(null);} };
    window.addEventListener('keydown',escape);
    return () => window.removeEventListener('keydown',escape);
  }, []);

  function arm(kind) {
    api?.setActiveTool({type:'selection'});
    setPreset(preset === kind ? null : kind);
  }
  function place(event) {
    if (event.target.tagName === 'CANVAS' && editingCardId) setEditingCardId(null);
    if (!preset || event.button !== 0 || event.target.tagName !== 'CANVAS' || api.getAppState().activeTool.type === 'hand') return;
    event.preventDefault(); event.stopPropagation();
    const at = viewportCoordsToSceneCoords({clientX:event.clientX,clientY:event.clientY},api.getAppState());
    const elements = cardElements({kind:preset,x:at.x,y:at.y,title:preset === 'task' ? 'Untitled task' : 'Untitled note',notes:'',status:'To do',link:''});
    const ids = Object.fromEntries(elements.map(element => [element.id,true]));
    setEditingCardId(elements[0].customData.oleaCardId);
    setFocusField(preset === 'note' ? 'body' : 'title');
    api.updateScene({elements:[...api.getSceneElements(),...elements],
      appState:{selectedElementIds:ids,selectedGroupIds:{[elements[0].customData.oleaCardId]:true}},captureUpdate:CaptureUpdateAction.IMMEDIATELY});
    setPreset(null);
  }
  function movePreview(event) {
    if (!preview.current) return;
    const overCanvas = event.target.tagName === 'CANVAS';
    preview.current.hidden = !overCanvas;
    preview.current.style.transform = `translate(${event.clientX}px,${event.clientY}px) scale(${api.getAppState().zoom.value})`;
  }
  function editCard(event) {
    if (!activeCard || event.target.tagName !== 'CANVAS') return;
    const at = viewportCoordsToSceneCoords({clientX:event.clientX,clientY:event.clientY},api.getAppState());
    const cx=activeCard.x+activeCard.width/2,cy=activeCard.y+activeCard.height/2;
    const dx=at.x-cx,dy=at.y-cy,angle=-activeCard.angle;
    const x=dx*Math.cos(angle)-dy*Math.sin(angle),y=dx*Math.sin(angle)+dy*Math.cos(angle);
    if (Math.abs(x)>activeCard.width/2 || Math.abs(y)>activeCard.height/2) return;
    event.preventDefault(); event.stopPropagation();
    setFocusField(y < -activeCard.height/2+110 ? 'title' : 'body');
    setEditingCardId(activeCard.customData.oleaCardId);
  }
  function closeInlineCard() {
    setEditingCardId(null);
    host.current.querySelector('.excalidraw')?.focus({preventScroll:true});
  }
  function editFromKeyboard(event) {
    if (event.key !== 'Enter' || !activeCard || editingCardId || ['INPUT','TEXTAREA','SELECT'].includes(event.target.tagName)) return;
    event.preventDefault(); event.stopPropagation();setFocusField('body');setEditingCardId(activeCard.customData.oleaCardId);
  }
  function updateCard(record) {
    if (!activeCard) return;
    const scene = api.getSceneElements(), existing = new Map(scene.map(element => [element.id,element]));
    const elements = cardElements({...record,x:activeCard.x,y:activeCard.y,width:activeCard.width,height:activeCard.height,angle:activeCard.angle});
    const replacements = elements.map(element => ({...element,version:(existing.get(element.id)?.version || 0)+1,updated:Date.now()}));
    const groupId = activeCard.customData.oleaCardId;
    api.updateScene({elements:scene.flatMap(element => element.id === activeCard.id ? replacements : element.customData?.oleaCardId === groupId ? [] : [element]),
      appState:{selectedElementIds:Object.fromEntries(replacements.map(element => [element.id,true])),selectedGroupIds:{[groupId]:true}},
      captureUpdate:CaptureUpdateAction.IMMEDIATELY});
  }
  function duplicateCards(next,previous) {
    const previousIds = new Set(previous.map(element => element.id)), groups = new Map();
    return next.map(element => {
      const oldId = element.customData?.oleaCardId;
      if (!oldId || previousIds.has(element.id)) return element;
      if (!groups.has(oldId)) groups.set(oldId,element.groupIds[0] || crypto.randomUUID());
      const id = groups.get(oldId);
      return {...element,customData:{...element.customData,oleaCardId:id,
        ...(element.customData.record ? {record:{...element.customData.record,id}} : {})}};
    });
  }
  function importLegacy(data) {
    const scene = legacyScene(data);
    if (api.getSceneElements().length && !confirm('Replace the current drawing with the previous board? Save a copy from the menu first if needed.')) return;
    blocked.current = false;
    api.updateScene({...scene,captureUpdate:CaptureUpdateAction.IMMEDIATELY});
    api.scrollToContent(scene.elements,{fitToViewport:true,viewportZoomFactor:.8});
    setIncoming(null); setNotice('');
  }
  async function importFile(event) {
    try {
      const file = event.target.files[0];
      if (!file) return;
      if (file.size > 10_000_000) throw Error('The backup is too large.');
      importLegacy(JSON.parse(await file.text()));
    } catch (error) { setNotice(`Import failed: ${error.message}`); }
    finally { event.target.value = ''; }
  }

  return <div className={`canvas-host${preset ? ' placing' : ''}${activeCard ? ' card-selected' : ''}`} ref={host}
    onPointerDownCapture={place} onPointerMoveCapture={movePreview} onDoubleClickCapture={editCard} onKeyDownCapture={editFromKeyboard}>
    <h1 className="sr-only">Olea canvas</h1>
    <Excalidraw excalidrawAPI={setApi} initialData={initial.scene} onChange={onChange} onLibraryChange={saveLibrary} onDuplicate={duplicateCards}
      autoFocus name="Olea canvas" aiEnabled={false}
      renderTopRightUI={isMobile => <div className={`card-tools${isMobile ? ' card-tools-mobile' : ''}`} role="toolbar" aria-label="Card presets">
        <button title="Place a note on the canvas" aria-pressed={preset === 'note'} onClick={() => arm('note')}><span aria-hidden="true">▤</span> Note</button>
        <button title="Place a task on the canvas" aria-pressed={preset === 'task'} onClick={() => arm('task')}><span aria-hidden="true">☑</span> Task</button>
      </div>}>
      <MainMenu>
        <MainMenu.DefaultItems.LoadScene />
        <MainMenu.DefaultItems.SaveToActiveFile />
        <MainMenu.DefaultItems.SaveAsImage />
        <MainMenu.Item onSelect={() => fileInput.current.click()}>Import previous board…</MainMenu.Item>
        <MainMenu.Separator />
        <MainMenu.DefaultItems.ClearCanvas />
        <MainMenu.DefaultItems.ToggleTheme />
        <MainMenu.DefaultItems.ChangeCanvasBackground />
        <MainMenu.Separator />
        <MainMenu.ItemLink href="https://excalidraw.com" target="_blank" rel="noreferrer">Canvas powered by Excalidraw</MainMenu.ItemLink>
      </MainMenu>
    </Excalidraw>
    {activeCard && editingCardId === activeCard.customData.oleaCardId && <InlineCard key={activeCard.id} card={activeCard} view={canvasView}
      onUpdate={updateCard} focusField={focusField} onClose={closeInlineCard}/>}
    {preset && <div className="placement-preview" ref={preview} hidden aria-hidden="true"><span>{preset === 'task' ? 'To do' : 'Note'}</span><strong>{preset === 'task' ? 'Untitled task' : 'Untitled note'}</strong></div>}
    {preset && <div className="placement-hint" role="status">Click to place {preset} · Escape to cancel</div>}
    {incoming && <div className="canvas-notice" role="status">Previous board found.
      <button onClick={() => {try {importLegacy(incoming);} catch(error) {setNotice(error.message);}}}>Import it</button>
      <button onClick={() => setIncoming(null)}>Keep current canvas</button>
    </div>}
    {notice && <div className="canvas-notice" role="alert">{notice}<button onClick={() => setNotice('')}>Dismiss</button></div>}
    <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={importFile}/>
  </div>;
}

createRoot(document.getElementById('root')).render(<App/>);
