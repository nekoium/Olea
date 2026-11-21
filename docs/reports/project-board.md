# Project board: canvas controls and Orca access

## Canvas controls

**USER DECISION**: Wheel up/down enlarges/shrinks the board; middle-drag pans; dragging anywhere on a card moves it; clicking without dragging opens editing. Source: the user's canvas-input instruction in this session. The user also asked the agent to infer related interaction improvements.

**OBSERVED**: Implemented in `board/board.js`, `board/board.css`, and `board/index.html`. Wheel zoom anchors at the pointer, including over notes. A five-screen-pixel movement threshold separates clicking from dragging. Card text does not select during dragging, and dragged cards appear above peers. Middle-drag and Space + drag pan over cards; empty-space left-drag still pans. Reference links are accessed from the editor so the whole card shares the same gesture behavior. Enter opens a focused card; existing arrow-key movement remains available. Browser storage format is unchanged.

**OBSERVED**: Task-lifetime headless Chrome checks on a direct file URL passed real pointer dragging/clicking over the header, title, notes, and reference area; small click jitter; middle-drag and Space-drag over cards; empty-space panning; pointer-anchored wheel zoom in both directions; zoom-correct task movement; position persistence through reload; keyboard editing and movement; editor save; reference URL; and pointer cancellation. Screenshots were reviewed at 1440/768/390 px with no page overflow or browser exceptions. Two initial diagnostic assertions needed fixture corrections: CDP wheel coordinates were rounded to integers, and the zoomed-drag fixture was kept inside the viewport. Neither was treated as a product failure. Temporary diagnostic files were removed after use. Physical mouse/trackpad hardware was not tested.

## Orca session access

**OBSERVED**: The installed Orca CLI's version-matched guide documents host-local agent-session search and bounded terminal reads. Session-history indexing was enabled and current at inspection. A conversation-only search scoped to this project returned the board-creation session and the #11/#14 discussion sessions, with titles, timestamps, snippets, structured-session/workspace identifiers, and present transcript source paths. No agent input was sent.

**OBSERVED**: The local Pi transcript returned for the #11 discussion was readable JSONL with user, assistant, and tool-result messages. Only envelope/type counts were printed during inspection. This establishes a practical route to a full Pi chat reader. The current-workspace terminal-list call returned no terminals; that result does not establish that structured chats are absent.

**AGENT PLAN**: For a future board integration, serve the board through a small loopback-only local helper in `board/`. The helper can search Orca for project-scoped sessions and read supported transcript formats on demand. The board can show session cards and open a conversation reader, with task links to particular sessions. Keep transcript data out of committed assets and board exports. The helper is needed because a directly opened web page cannot execute Orca commands or freely read local transcripts.

**OPEN**: No integration was implemented in this change. Full transcript rendering was checked only for the existing Pi format; other agents need their own verified readers. Automatic refresh, in-Orca navigation, remote-host sessions, and a native Orca plugin remain unverified. The initial request here is chat review, so sending prompts is not needed to establish the proposed reader.
