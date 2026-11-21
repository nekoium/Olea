(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const key = 'olea-project-board-v1';
  const statuses = ['To do', 'In progress', 'Discuss', 'Done', 'Later'];
  const viewport = $('viewport'), world = $('world'), editor = $('editor'), form = $('task-form');
  let tasks = structuredClone(window.OLEA_SEED), view = {x:24, y:24, zoom:1};
  let editing = null, position = null, gesture = null, storageBlocked = false;

  function validate(data) {
    if (data?.version !== 1 || !Array.isArray(data.tasks) || data.tasks.length > 5000) throw Error('Invalid board file.');
    const ids = new Set();
    for (const task of data.tasks) {
      if (!task || typeof task.id !== 'string' || !task.id || ids.has(task.id) ||
          typeof task.title !== 'string' || !task.title.trim() || task.title.length > 180 ||
          !statuses.includes(task.status) || typeof task.notes !== 'string' || task.notes.length > 12000 ||
          typeof task.link !== 'string' || task.link.length > 4000 ||
          !Number.isFinite(task.x) || !Number.isFinite(task.y) || Math.abs(task.x) > 1e8 || Math.abs(task.y) > 1e8) throw Error('Invalid task in board file.');
      safeLink(task.link);
      ids.add(task.id);
    }
    return data.tasks.map(({id,title,status,notes,link,x,y}) => ({id,title,status,notes,link,x,y}));
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
    return tasks.filter(task => (!$('filter').value || task.status === $('filter').value) &&
      `${task.title} ${task.notes}`.toLocaleLowerCase().includes(query));
  }
  function button(text, label, action, className = '') {
    const node = document.createElement('button');
    node.type = 'button'; node.textContent = text; node.className = className;
    node.setAttribute('aria-label', label); node.addEventListener('click', action);
    return node;
  }
  function render() {
    world.replaceChildren();
    const visible = matching();
    for (const task of visible) {
      const card = document.createElement('article');
      card.dataset.id = task.id; card.dataset.status = task.status; card.tabIndex = 0;
      card.setAttribute('aria-label', `${task.title}, ${task.status}. Shift and arrow keys to move.`);
      card.style.left = `${task.x}px`; card.style.top = `${task.y}px`;
      const head = document.createElement('div'); head.className = 'card-head';
      const status = document.createElement('span'); status.className = 'status'; status.textContent = task.status;
      head.append(status, button('Edit', `Edit ${task.title}`, () => editTask(task)));
      const body = document.createElement('div'); body.className = 'card-body';
      body.append(button(task.title, `Edit ${task.title}`, () => editTask(task), 'card-title'));
      if (task.notes) {
        const notes = document.createElement('p'); notes.className = 'notes'; notes.textContent = task.notes; body.append(notes);
      }
      if (task.link) {
        const link = document.createElement('a'); link.className = 'card-link'; link.href = safeLink(task.link);
        link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = 'Open reference'; body.append(link);
      }
      card.append(head, body); world.append(card);
    }
    $('summary').textContent = `${tasks.filter(t => t.status === 'Done').length}/${tasks.length} done · ${visible.length} shown`;
    $('empty').hidden = visible.length !== 0;
    transform();
  }
  function point(clientX, clientY) {
    const rect = viewport.getBoundingClientRect();
    return {x:(clientX - rect.left - view.x)/view.zoom, y:(clientY - rect.top - view.y)/view.zoom};
  }
  function editTask(task = null, at = null) {
    editing = task?.id ?? null;
    position = at || point(viewport.clientWidth / 2 + viewport.getBoundingClientRect().left - 140 * view.zoom,
      viewport.clientHeight / 2 + viewport.getBoundingClientRect().top - 100 * view.zoom);
    $('editor-title').textContent = task ? 'Edit task' : 'New task';
    for (const name of ['title','status','notes','link']) form.elements[name].value = task?.[name] ?? (name === 'status' ? 'To do' : '');
    $('delete').hidden = !task;
    form.elements.link.setCustomValidity('');
    editor.showModal(); form.elements.title.focus();
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    const title = form.elements.title.value.trim();
    if (!title) { form.elements.title.setCustomValidity('Enter a task title.'); form.elements.title.reportValidity(); return; }
    let link;
    try { link = safeLink(form.elements.link.value.trim()); }
    catch { form.elements.link.setCustomValidity('Use an http or https link.'); form.elements.link.reportValidity(); return; }
    const fields = {title, status:form.elements.status.value, notes:form.elements.notes.value, link};
    if (editing) Object.assign(tasks.find(task => task.id === editing), fields);
    else tasks.push({id:crypto.randomUUID(), ...fields, ...position});
    editor.close(); render(); save();
  });
  form.elements.title.oninput = () => form.elements.title.setCustomValidity('');
  form.elements.link.oninput = () => form.elements.link.setCustomValidity('');
  $('cancel').onclick = () => editor.close();
  $('delete').onclick = () => {
    if (!confirm('Delete this task?')) return;
    tasks = tasks.filter(task => task.id !== editing); editor.close(); render(); save();
  };
  $('add').onclick = () => editTask();
  $('search').oninput = render; $('filter').onchange = render;
  viewport.addEventListener('dblclick', event => { if (!event.target.closest('article')) editTask(null, point(event.clientX,event.clientY)); });
  viewport.addEventListener('pointerdown', event => {
    if (event.button !== 0 || event.target.closest('button,a,input,select,textarea')) return;
    const card = event.target.closest('article');
    if (card && !event.target.closest('.card-head')) return;
    const task = card && tasks.find(t => t.id === card.dataset.id);
    gesture = {id:event.pointerId, startX:event.clientX, startY:event.clientY, x:task ? task.x : view.x, y:task ? task.y : view.y, task, card};
    viewport.setPointerCapture(event.pointerId); viewport.classList.add('panning'); event.preventDefault();
  });
  viewport.addEventListener('pointermove', event => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const dx = event.clientX - gesture.startX, dy = event.clientY - gesture.startY;
    if (gesture.task) {
      gesture.task.x = gesture.x + dx/view.zoom; gesture.task.y = gesture.y + dy/view.zoom;
      gesture.card.style.left = `${gesture.task.x}px`; gesture.card.style.top = `${gesture.task.y}px`;
    } else { view.x = gesture.x + dx; view.y = gesture.y + dy; transform(); }
  });
  function endGesture() { if (gesture) { gesture = null; viewport.classList.remove('panning'); save(); } }
  viewport.addEventListener('pointerup', endGesture); viewport.addEventListener('pointercancel', endGesture);
  viewport.addEventListener('lostpointercapture', endGesture);
  function zoom(factor, x = viewport.clientWidth/2, y = viewport.clientHeight/2) {
    const next = Math.max(.25, Math.min(2, view.zoom * factor)), ratio = next / view.zoom;
    view.x = x - (x-view.x)*ratio; view.y = y - (y-view.y)*ratio; view.zoom = next; transform(); save();
  }
  viewport.addEventListener('wheel', event => {
    if (event.target.closest('.notes') && !event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    const rect = viewport.getBoundingClientRect();
    if (event.ctrlKey || event.metaKey) zoom(Math.exp(-event.deltaY*.005), event.clientX-rect.left, event.clientY-rect.top);
    else { view.x -= event.deltaX; view.y -= event.deltaY; transform(); save(); }
  }, {passive:false});
  viewport.addEventListener('keydown', event => {
    if (event.target.closest('button,a')) return;
    const moves = {ArrowLeft:[-32,0],ArrowRight:[32,0],ArrowUp:[0,-32],ArrowDown:[0,32]};
    if (!moves[event.key]) return;
    event.preventDefault(); const [dx,dy] = moves[event.key]; const card = event.target.closest('article');
    if (event.shiftKey && card) {
      const task = tasks.find(t => t.id === card.dataset.id); task.x += dx; task.y += dy;
      card.style.left = `${task.x}px`; card.style.top = `${task.y}px`;
    } else { view.x -= dx; view.y -= dy; transform(); }
    save();
  });
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
      if (!confirm(`Replace the current ${tasks.length} tasks with ${imported.length} imported tasks? Export first if you need a backup.`)) return;
      tasks = imported; storageBlocked = false; $('search').value = ''; $('filter').value = ''; render(); $('fit').click(); save();
    } catch (error) { alert(`Import failed: ${error.message}`); }
    finally { $('file').value = ''; }
  };
  render();
})();
