# Olea project board

A small, offline infinite canvas for tracking Olea tasks and progress. Open `index.html` in a modern browser. No installation, server, or build step is required.

- Add a task, then give it a title, notes, status, and optional reference link.
- Drag a card header to move the task. Click its title or **Edit** to change it.
- Drag empty canvas space to pan. A mouse wheel or trackpad also pans.
- Use **+** / **−** to zoom, or Ctrl/Cmd + wheel. **Fit all** brings matching tasks into view.
- Double-click empty space to add a task there.
- Search tasks or filter by status.
- With the canvas focused, use arrow keys to pan. Focus a card and use Shift + arrow keys to move it.

Edits and positions save in this browser's local storage. Use **Export** to download a JSON backup, and **Import** to restore it. Import replaces the current board after confirmation. Clearing browser data removes the saved board. Browser storage for directly opened files can vary; keep exports for anything you need to preserve. Moving the folder or switching browsers may give you a separate saved board.

The initial ten cards are a snapshot from `docs/PROGRESS.md`, `docs/ROADMAP.md`, and `PRODUCT.md` at creation. They include issue links, completed work, open discussions, and deferred work. The board does not automatically sync GitHub or update project documents. Changing a card changes only your saved board.

All task data stays in your browser unless you export it. Reference links open external sites when clicked. The board uses no external scripts, fonts, or network services.

Part of Olea, under the repository's MIT license.
