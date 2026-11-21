# Olea canvas

A full-screen whiteboard for project plans, notes, diagrams, and visual thinking. It uses [Excalidraw](https://github.com/excalidraw/excalidraw) with clean lines and a normal sans-serif font. Tools float above the canvas; there is no page header or footer taking space from your work.

## Open the canvas

Install Node.js 22.12 or newer. On Windows, open **`start.cmd`** in this folder. It installs dependencies on first use and opens the canvas in your browser.

Or use a terminal:

```sh
cd board
npm ci
npm start
```

The canvas opens at **http://127.0.0.1:4173/app.html**. Keep the terminal running while you use it.

## Work directly on the canvas

- Pick a visible tool, then click or drag where you want the object: rectangle, diamond, ellipse, arrow, line, freehand drawing, text, or image. More tools include frames and web embeds.
- Choose **Note** or **Task** to see a card preview under the pointer, then click to place it immediately. New cards are ready to type in. Double-click an existing card to edit its title and content directly inside it; changes save as you type. Cards have padded titles, readable content previews, quiet references, and task-status pills. Editing a card shows its full content in place.
- Click to select. Drag empty space to select several objects, then move or resize the selection. Shift-click adds or removes objects.
- Middle-drag, Space-drag, or the hand tool pans the canvas. Wheel up/down zooms at the pointer.
- Double-click a shape to label it, or empty space to write text. Double-click a card to type inside it; press Escape or click the canvas to finish.
- Use the floating properties panel to change shape colors, strokes, fills, and text. Use the library for reusable objects.
- Undo/redo, duplication, grouping, rotation, copy/paste, and keyboard shortcuts come from Excalidraw. Press **?** for shortcut help.

## Save and bring existing work

The drawing, images, view preferences, and personal library save in this browser. Use the small canvas menu to save a `.excalidraw` file, open a saved drawing, or export an image. Keep file backups: clearing browser data removes browser saves, and large images can exceed browser-storage limits. The canvas shows an error if autosave fails.

Existing project cards are converted into editable canvas groups. Their full content is kept with the card, even when its preview is shortened. Task cards are one kind of object; they do not limit the rest of the canvas.

If you previously opened the board directly as a local file, open **`index.html`** the same way, then click **Open canvas**. That link carries the previous board into the new canvas without changing the original saved data. It also offers a backup download. You can instead import an old JSON backup through **Import previous board…** in the canvas menu. Replacing an existing drawing requires confirmation.

The starter project cards are a snapshot, not live GitHub or Orca synchronization. This version runs locally and has no collaboration server. External reference links, web embeds, and browsing public libraries can contact external sites when used.

Part of Olea under the repository's MIT license. The canvas engine is Excalidraw, also MIT licensed; its dependencies retain their respective licenses.
