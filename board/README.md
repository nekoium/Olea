# Olea project board

A small, offline infinite canvas for notes, ideas, and project tasks. Open `index.html` in a modern browser. No installation, server, or build step is required.

- Use **Add card** to create a plain note. Choose **Task** in the editor when a card needs a progress status.
- Click a card to select it. Shift-click or Ctrl/Cmd-click adds or removes it from the selection.
- Left-drag empty space to draw a selection box. Cards touched by the box are selected. Hold Shift or Ctrl/Cmd to add to the current selection.
- Drag anywhere on a selected card to move the selected cards together. Dragging an unselected card selects and moves that card.
- Double-click a card, press Enter on a focused card, or use **Edit** with one card selected to change its content. Reference links open from the editor.
- Middle-drag anywhere, or hold Space and drag, to pan.
- Wheel up to zoom in and down to zoom out, centered under your pointer. Trackpad vertical scrolling also zooms. Use **+** / **−** for centered zoom; **Fit all** brings matching cards into view.
- Double-click empty space to add a note there.
- Search cards, show only notes, or filter tasks by status.
- With the canvas focused, Ctrl/Cmd+A selects all visible cards. Delete/Backspace or **Delete** removes the selection after confirmation. Escape clears selection, or cancels an active drag and restores positions.
- Arrow keys pan. Shift + arrow keys move selected cards together.

Edits and positions save in this browser's local storage. Use **Export** to download a JSON backup, and **Import** to restore it. Import replaces the current board after confirmation. Clearing browser data removes the saved board. Browser storage for directly opened files can vary; keep exports for anything you need to preserve. Moving the folder or switching browsers may give you a separate saved board.

The initial ten cards are a snapshot from `docs/PROGRESS.md`, `docs/ROADMAP.md`, and `PRODUCT.md` at creation. They include issue links, completed work, open discussions, and deferred work. The board does not automatically sync GitHub or update project documents. Changing a card changes only your saved board.

All card data stays in your browser unless you export it. Reference links open external sites when clicked. The board uses no external scripts, fonts, or network services.

Part of Olea, under the repository's MIT license.
