# Experience-map discussion

Status: discussion history and bounded storage findings. [DESIGN.md](../../DESIGN.md) consolidates current decisions. The user subsequently ended the question rounds and requested direct design work; no finished map is implied by this record.

## Follow-up decisions

Source: user's latest replies to Q2/Q7/Q8/Q9.

- **USER DECISION**: Offer All workspaces and individual workspace filters, with workspace names in the combined list.
- **USER DECISION**: Setup first; configure one chosen agent and allow explicit skips for optional phone capabilities.
- **USER DECISION**: Test external working-directory support first. The intended volume is `/storage/emulated/0`; offering an Olea folder there is accepted subject to feasibility. No folder was created.
- **USER DECISION**: Done means turn completion, not proof of task success. Needs you, Working and Error communicate the recommended states; Stopped remains distinct.
- **USER DECISION**: Continue actual design without further questions, record decisions in root `DESIGN.md`, and update the document index.

The earlier OPEN entries below preserve the preceding round, not the current resolution.

## Current round

Source: user's replies to experience-map grilling questions Q1–Q6 in this session.

- **USER DECISION**: Setup comes before running tasks. The user cites the need to grant permissions during setup.
- **USER DECISION**: Provide onboarding. **OPEN**: Which permissions are mandatory, optional, or requested when needed.
- **OPEN**: All-workspace Conversations view. The user requested a visual explanation before deciding.
- **USER DECISION**: Support creating an Olea-managed workspace and connecting an Android folder, subject to technical feasibility. **OPEN**: Whether to create an Olea folder at shared-storage root; the user asked for assessment, not implementation.
- **USER DECISION**: Users can leave working conversations, browse other workspaces, and start another session without stopping the first. This does not establish Android background survival.
- **USER DECISION**: Refer to Orca for session states: Needs you, Working, Done, Error. **OPEN**: Exact behavior and presentation, including stopped sessions; inspect Orca before claiming its implementation details.

## Storage findings

- **OBSERVED**: `runtime/linux.sh` binds the app-private `data/workspace` directory to `/workspace`. Backend workspace validation resolves paths under its configured workspace root.
- **OBSERVED**: `PhoneAccessActivity.kt` requests a document tree through `ACTION_OPEN_DOCUMENT_TREE`; `PhoneBridge.kt` uses `DocumentsContract` for folder operations. This does not provide a mounted filesystem directory to stock agent processes.
- **OBSERVED**: The current Android manifest does not declare `MANAGE_EXTERNAL_STORAGE`.
- **OBSERVED**: Android documentation says user-granted all-files access permits direct file paths in shared storage, with protected-directory exclusions. Source: https://developer.android.com/training/data-storage/manage-all-files
- **OPEN**: Direct external workspace support requires validation of permissions, PRoot bindings, backend workspace resolution, and shared-storage filesystem behavior. No device experiment was performed in this discussion.
- **AGENT PLAN**: Keep Linux runtimes, installed tools and credentials in app-private storage. Assess `/storage/emulated/0/Olea` as an optional user-visible workspace location, not a validated default. `/sdcard` commonly aliases primary shared storage, not necessarily a removable SD card.

Existing scenario board and concurrent files remain untouched.
