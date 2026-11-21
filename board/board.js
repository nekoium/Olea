(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const key = 'olea-project-board-v1';
  const statuses = ['To do', 'In progress', 'Discuss', 'Done', 'Later'];
  const viewport = $('viewport'), world = $('world'), editor = $('editor'), form = $('task-form');
  let tasks = structuredClone(window.OLEA_SEED), view = {x:24, y:24, zoom:1};
  let selected = new Set();
  let editing = null, position = null, gesture = null, storageBlocked = false, spaceHeld = false;

  function validate(data) {
    if (data?.version !== 1 || !Array.isArray(data.tasks) || data.tasks.length > 5000) throw Error('Invalid board file.');
    const ids = new Set();
    for (const task of data.tasks) {
      if (!task || typeof task.id !== 'string' || !task.id || ids.has(task.id) ||
          typeof task.title !== 'string' || !task.title.trim() || task.title.length > 180 ||
          !['task','note'].includes(task.kind ?? 'task') ||
          !statuses.includes(task.status) || typeof task.notes !== 'string' || task.notes.length > 12000 ||
          typeof task.link !== 'string' || task.link.length > 4000 ||
          !Number.isFinite(task.x) || !Number.isFinite(task.y) || Math.abs(task.x) > 1e8 || Math.abs(task.y) > 1e8) throw Error('Invalid task in board file.');
      safeLink(task.link);
      ids.add(task.id);
    }
    return data.tasks.map(({id,title,status,notes,link,x,y,kind = 'task'}) => ({id,title,status,notes,link,x,y,kind}));
  }
  function safeLink(link) {
    if (!link) return '';
    const url = new URL(link);
    if (!['https:', 'http:'].includes(url.protocol)) throw Error('Use an http or https link.');
    return url.href;
  }
  function message(text, error = false) {
    $('save-state').textContent = text;
    $('save-state').classList.toggle('error', error);
  }
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const data = JSON.parse(saved);
      tasks = validate(data);
      if (data.view && [data.view.x, data.view.y, data.view.zoom].every(Number.isFinite)) {
        view = {...data.view, zoom:Math.max(.25, Math.min(2, data.view.zoom))};
      }
    }
  } catch {
    storageBlocked = true;
    message('Saved board unavailable. Export changes for backup.', true);
  }
  function save() {
    if (storageBlocked) return message('Autosave unavailable. Export changes for backup.', true);
    try {
      localStorage.setItem(key, JSON.stringify({version:1, tasks, view}));
      message('Saved in this browser');
    } catch { message('Could not save. Export changes for backup.', true); }
  }
  function transform() {
    world.style.transform = `translate(${view.x}px,${view.y}px) scale(${view.zoom})`;
    $('scale').textContent = `${Math.round(view.zoom * 100)}%`;
  }
  function matching() {
    const query = $('search').value.toLocaleLowerCase();
    const filter = $('filter').value;
    return tasks.filter(task => (!filter || (filter === 'note' ? task.kind === 'note' : task.kind !== 'note' && task.status === filter)) &&
      `${task.title} ${task.notes}`.toLocaleLowerCase().includes(query));
  }
  function updateSelection() {
    for (const card of world.children) {
      const active = selected.has(card.dataset.id);
      card.classList.toggle('selected', active);
      card.setAttribute('aria-selected', String(active));
    }
    $('selection-count').textContent = `${selected.size} selected`;
    $('edit-selection').disabled = selected.size !== 1;
    $('delete-selection').disabled = selected.size === 0;
  }
  function render() {
    const focusedId = document.activeElement.closest('article')?.dataset.id;
    world.replaceChildren();
    const visible = matching();
    selected = new Set([...selected].filter(id => visible.some(task => task.id === id)));
    for (const task of visible) {
      const card = document.createElement('article');
      card.dataset.id = task.id; card.dataset.status = task.kind === 'note' ? '' : task.status; card.tabIndex = 0;
      card.setAttribute('role', 'option');
      card.setAttribute('aria-label', `${task.title}, ${task.kind === 'note' ? 'note' : task.status}. Enter to edit.`);
      card.style.left = `${task.x}px`; card.style.top = `${task.y}px`;
      const head = document.createElement('div'); head.className = 'card-head';
      const status = document.createElement('span'); status.className = 'status'; status.textContent = task.status;
      head.append(status);
      const body = document.createElement('div'); body.className = 'card-body';
      const title = document.createElement('h2'); title.className = 'card-title'; title.textContent = task.title;
      body.append(title);
      if (task.notes) {
        const notes = document.createElement('p'); notes.className = 'notes'; notes.textContent = task.notes; body.append(notes);
      }
      if (task.link) {
        const reference = document.createElement('span'); reference.className = 'card-link';
        reference.textContent = 'Reference attached'; body.append(reference);
      }
      if (task.kind !== 'note') card.append(head);
      card.append(body); world.append(card);
    }
    const taskCards = tasks.filter(task => task.kind !== 'note');
    $('summary').textContent = `${visible.length} cards · ${taskCards.filter(t => t.status === 'Done').length}/${taskCards.length} tasks done`;
    $('empty').hidden = visible.length !== 0;
    updateSelection();
    transform();
    if (focusedId) ([...world.children].find(card => card.dataset.id === focusedId) || viewport).focus({preventScroll:true});
  }
  function point(clientX, clientY) {
    const rect = viewport.getBoundingClientRect();
    return {x:(clientX - rect.left - view.x)/view.zoom, y:(clientY - rect.top - view.y)/view.zoom};
  }
  function editTask(task = null, at = null) {
    editing = task?.id ?? null;
    position = at || point(viewport.clientWidth / 2 + viewport.getBoundingClientRect().left - 140 * view.zoom,
      viewport.clientHeight / 2 + viewport.getBoundingClientRect().top - 100 * view.zoom);
    $('editor-title').textContent = task ? 'Edit card' : 'New card';
    for (const name of ['title','status','notes','link']) form.elements[name].value = task?.[name] ?? (name === 'status' ? 'To do' : '');
    form.elements.kind.value = task ? (task.kind ?? 'task') : 'note';
    updateKind();
    form.elements.title.setCustomValidity('');
    $('delete').hidden = !task;
    form.elements.link.setCustomValidity('');
    $('reference').hidden = !task?.link;
    if (task?.link) $('reference').href = safeLink(task.link);
    editor.showModal(); form.elements.title.focus();
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    const title = form.elements.title.value.trim();
    if (!title) { form.elements.title.setCustomValidity('Enter a card title.'); form.elements.title.reportValidity(); return; }
    let link;
    try { link = safeLink(form.elements.link.value.trim()); }
    catch { form.elements.link.setCustomValidity('Use an http or https link.'); form.elements.link.reportValidity(); return; }
    const fields = {title, kind:form.elements.kind.value, status:form.elements.status.value, notes:form.elements.notes.value, link};
    if (editing) Object.assign(tasks.find(task => task.id === editing), fields);
    else {
      const task = {id:crypto.randomUUID(), ...fields, ...position};
      tasks.push(task); selected = new Set([task.id]);
    }
    editor.close(); render(); save();
  });
  function updateKind() { $('status-field').hidden = form.elements.kind.value !== 'task'; }
  form.elements.kind.onchange = updateKind;
  form.elements.title.oninput = () => form.elements.title.setCustomValidity('');
  form.elements.link.oninput = () => {
    form.elements.link.setCustomValidity('');
    try {
      const link = safeLink(form.elements.link.value.trim());
      $('reference').hidden = !link;
      if (link) $('reference').href = link;
    } catch { $('reference').hidden = true; }
  };
  $('cancel').onclick = () => editor.close();
  $('delete').onclick = () => {
    if (!confirm('Delete this card?')) return;
    tasks = tasks.filter(task => task.id !== editing); editor.close(); render(); save();
  };
  function deleteSelection() {
    if (!selected.size || !confirm(`Delete ${selected.size} selected card${selected.size === 1 ? '' : 's'}?`)) return;
    tasks = tasks.filter(task => !selected.has(task.id)); selected.clear(); render(); save();
  }
  $('delete-selection').onclick = deleteSelection;
  $('edit-selection').onclick = () => editTask(tasks.find(task => selected.has(task.id)));
  $('add').onclick = () => editTask();
  $('search').oninput = render; $('filter').onchange = render;
  viewport.addEventListener('dblclick', event => {
    if (spaceHeld || event.button !== 0) return;
    const card = document.elementFromPoint(event.clientX, event.clientY)?.closest('article');
    editTask(card ? tasks.find(task => task.id === card.dataset.id) : null, point(event.clientX, event.clientY));
  });
  viewport.addEventListener('pointerdown', event => {
    if (gesture || ![0, 1].includes(event.button)) return;
    const card = event.target.closest('article');
    const pan = event.button === 1 || spaceHeld;
    const additive = event.shiftKey || event.ctrlKey || event.metaKey;
    const before = new Set(selected);
    let mode = pan ? 'pan' : card ? 'move' : 'select';
    if (!pan) {
      if (card) {
        const id = card.dataset.id;
        if (additive && selected.has(id)) { selected.delete(id); mode = 'toggle'; }
        else if (additive) selected.add(id);
        else if (!selected.has(id)) selected = new Set([id]);
      } else if (!additive) selected.clear();
      updateSelection();
    }
    const cards = new Map([...world.children].map(node => [node.dataset.id, node]));
    gesture = {id:event.pointerId, mode, startX:event.clientX, startY:event.clientY,
      x:view.x, y:view.y, before, base:new Set(selected), moved:false,
      origins:tasks.filter(task => selected.has(task.id)).map(task => ({task,card:cards.get(task.id),x:task.x,y:task.y}))};
    (card || viewport).focus({preventScroll:true});
    viewport.setPointerCapture(event.pointerId);
    if (pan) viewport.classList.add('panning');
    event.preventDefault();
  });
  viewport.addEventListener('pointermove', event => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const dx = event.clientX - gesture.startX, dy = event.clientY - gesture.startY;
    if (!gesture.moved && Math.hypot(dx, dy) < 5) return;
    gesture.moved = true;
    if (gesture.mode === 'move') {
      for (const {task,card,x,y} of gesture.origins) {
        task.x = x + dx/view.zoom; task.y = y + dy/view.zoom;
        card.classList.add('dragging');
        card.style.left = `${task.x}px`; card.style.top = `${task.y}px`;
      }
    } else if (gesture.mode === 'pan') {
      view.x = gesture.x + dx; view.y = gesture.y + dy; transform();
    } else if (gesture.mode === 'select') {
      const left = Math.min(gesture.startX,event.clientX), top = Math.min(gesture.startY,event.clientY);
      const right = Math.max(gesture.startX,event.clientX), bottom = Math.max(gesture.startY,event.clientY);
      const bounds = viewport.getBoundingClientRect(), box = $('selection-box');
      box.hidden = false;
      Object.assign(box.style, {left:`${left-bounds.left}px`,top:`${top-bounds.top}px`,width:`${right-left}px`,height:`${bottom-top}px`});
      selected = new Set(gesture.base);
      for (const card of world.children) {
        const rect = card.getBoundingClientRect();
        if (rect.left < right && rect.right > left && rect.top < bottom && rect.bottom > top) selected.add(card.dataset.id);
      }
      updateSelection();
    }
  });
  function endGesture(event) {
    if (!gesture || event.pointerId !== gesture.id) return;
    const finished = gesture;
    gesture = null;
    viewport.classList.remove('panning');
    $('selection-box').hidden = true;
    for (const card of world.children) card.classList.remove('dragging');
    if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
    if (event.type !== 'pointerup') {
      for (const {task,x,y} of finished.origins) Object.assign(task,{x,y});
      view.x = finished.x; view.y = finished.y; selected = finished.before; render();
    } else if (finished.moved && ['move','pan'].includes(finished.mode)) save();
  }
  viewport.addEventListener('pointerup', endGesture); viewport.addEventListener('pointercancel', endGesture);
  viewport.addEventListener('lostpointercapture', endGesture);
  viewport.addEventListener('auxclick', event => { if (event.button === 1) event.preventDefault(); });
  function zoom(factor, x = viewport.clientWidth/2, y = viewport.clientHeight/2) {
    const next = Math.max(.25, Math.min(2, view.zoom * factor)), ratio = next / view.zoom;
    view.x = x - (x-view.x)*ratio; view.y = y - (y-view.y)*ratio; view.zoom = next; transform(); save();
  }
  viewport.addEventListener('wheel', event => {
    event.preventDefault();
    if (gesture) return;
    const rect = viewport.getBoundingClientRect();
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientHeight : 1);
    zoom(Math.exp(-Math.max(-240, Math.min(240, delta))*.002), event.clientX-rect.left, event.clientY-rect.top);
  }, {passive:false});
  viewport.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      if (gesture) endGesture({pointerId:gesture.id,type:'pointercancel'});
      else { selected.clear(); updateSelection(); }
      return;
    }
    if (gesture) return;
    const card = event.target.closest('article');
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
      event.preventDefault(); selected = new Set(matching().map(task => task.id)); updateSelection(); return;
    }
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault(); deleteSelection(); return;
    }
    if (event.code === 'Space') {
      event.preventDefault(); spaceHeld = true; viewport.classList.add('pan-ready'); return;
    }
    if (event.key === 'Enter' && card) {
      event.preventDefault(); editTask(tasks.find(t => t.id === card.dataset.id)); return;
    }
    const moves = {ArrowLeft:[-32,0],ArrowRight:[32,0],ArrowUp:[0,-32],ArrowDown:[0,32]};
    if (!moves[event.key]) return;
    event.preventDefault(); const [dx,dy] = moves[event.key];
    if (event.shiftKey && selected.size) {
      for (const task of tasks.filter(task => selected.has(task.id))) {
        task.x += dx; task.y += dy;
        const node = [...world.children].find(node => node.dataset.id === task.id);
        node.style.left = `${task.x}px`; node.style.top = `${task.y}px`;
      }
    } else { view.x -= dx; view.y -= dy; transform(); }
    save();
  });
  function releaseSpace() { spaceHeld = false; viewport.classList.remove('pan-ready'); }
  window.addEventListener('keyup', event => { if (event.code === 'Space') releaseSpace(); });
  window.addEventListener('blur', releaseSpace);
  $('in').onclick = () => zoom(1.2); $('out').onclick = () => zoom(1/1.2);
  $('fit').onclick = () => {
    const cards = [...world.children];
    if (!cards.length) { view = {x:24,y:24,zoom:1}; transform(); save(); return; }
    const minX = Math.min(...cards.map(c => parseFloat(c.style.left))), minY = Math.min(...cards.map(c => parseFloat(c.style.top)));
    const width = Math.max(...cards.map(c => parseFloat(c.style.left)+c.offsetWidth))-minX;
    const height = Math.max(...cards.map(c => parseFloat(c.style.top)+c.offsetHeight))-minY;
    const scale = Math.max(.25, Math.min(1, (viewport.clientWidth-48)/width, (viewport.clientHeight-48)/height));
    view = {x:(viewport.clientWidth-width*scale)/2-minX*scale, y:(viewport.clientHeight-height*scale)/2-minY*scale, zoom:scale};
    transform(); save();
  };
  $('export').onclick = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify({version:1,tasks,view},null,2)], {type:'application/json'}));
    const link = document.createElement('a'); link.href = url; link.download = 'olea-board.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url),1000);
  };
  $('import').onclick = () => $('file').click();
  $('file').onchange = async () => {
    const file = $('file').files[0]; if (!file) return;
    try {
      if (file.size > 10_000_000) throw Error('Board file is too large (maximum 10 MB).');
      const imported = validate(JSON.parse(await file.text()));
      if (!confirm(`Replace the current ${tasks.length} cards with ${imported.length} imported cards? Export first if you need a backup.`)) return;
      tasks = imported; selected.clear(); storageBlocked = false; $('search').value = ''; $('filter').value = ''; render(); $('fit').click(); save();
    } catch (error) { alert(`Import failed: ${error.message}`); }
    finally { $('file').value = ''; }
  };
  render();
})();
