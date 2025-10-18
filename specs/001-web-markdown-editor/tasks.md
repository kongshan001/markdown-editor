# Tasks: Web Markdown Editor

**Input**: Design documents from `/specs/001-web-markdown-editor/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL and not included in this task list as they were not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `src/`, `tests/` at repository root
- Paths shown below follow the structure defined in plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project directory structure with src/, public/, tests/ directories
- [x] T002 Initialize Vite project with vanilla JavaScript template using npm create vite
- [x] T003 Install dependencies: marked (markdown parser) via npm
- [x] T004 [P] Install dev dependencies: vitest, @vitest/ui, jsdom via npm
- [x] T005 [P] Create vitest.config.js with jsdom environment configuration
- [x] T006 [P] Update package.json scripts for dev, build, preview, test commands
- [x] T007 [P] Create basic public/index.html with app container and root elements
- [x] T008 [P] Create public/styles.css with base CSS reset and variables

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 [P] Create Document model class in src/models/Document.js with all fields per data-model.md
- [x] T010 [P] Create dateFormatter utility in src/utils/dateFormatter.js for timestamp display
- [x] T011 Implement validationService in src/services/validationService.js with validateFilename and validateDocument methods
- [x] T012 Implement storageService in src/services/storageService.js with LocalStorage CRUD operations (saveDocument, getDocument, deleteDocument, listDocuments, getStorageStats)
- [x] T013 Implement markdownService in src/services/markdownService.js with marked.js integration (renderToHTML, getSupportedSyntax)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create and Edit Markdown Document (Priority: P1) 🎯 MVP

**Goal**: Users can write and edit markdown content with real-time HTML preview

**Independent Test**: Open the editor, type markdown syntax (headings, lists, bold, italic, links, images, code blocks), and verify the preview updates in real-time within 100ms

### Implementation for User Story 1

- [x] T014 [P] [US1] Create Editor component in src/components/Editor.js with textarea, content-changed event, and keyboard shortcut handlers
- [x] T015 [P] [US1] Create Preview component in src/components/Preview.js with markdown rendering integration
- [x] T016 [US1] Implement debounced preview update logic (150ms delay) in src/app.js to handle editor input
- [x] T017 [US1] Create two-pane layout in public/index.html with editor on left and preview on right
- [x] T018 [US1] Style editor and preview panes in public/styles.css with CSS Grid for desktop, flexbox for mobile
- [x] T019 [US1] Integrate Editor and Preview components in src/app.js with event wiring
- [x] T020 [US1] Test markdown syntax rendering: headings, bold, italic, lists, links, images, code blocks, blockquotes

**Checkpoint**: At this point, User Story 1 should be fully functional - users can type markdown and see real-time preview

---

## Phase 4: User Story 2 - Save and Persist Documents (Priority: P2)

**Goal**: Users can save their work to browser LocalStorage so documents persist across browser sessions

**Independent Test**: Create a document, click save with a filename, close the browser, reopen the editor, and verify the document can be retrieved from storage

### Implementation for User Story 2

- [ ] T021 [P] [US2] Create SaveDialog component in src/components/SaveDialog.js with filename input, validation, and save/cancel events
- [ ] T022 [US2] Add Save button to toolbar in public/index.html
- [ ] T023 [US2] Implement save workflow in src/app.js: show SaveDialog, validate filename, call storageService.saveDocument
- [ ] T024 [US2] Add current document state tracking in src/app.js (currentDocument variable)
- [ ] T025 [US2] Implement filename validation UI feedback in SaveDialog component showing validation errors
- [ ] T026 [US2] Handle save confirmation dialog for overwrite scenario when filename exists
- [ ] T027 [US2] Add visual feedback during save operation (loading indicator) in SaveDialog
- [ ] T028 [US2] Implement error handling for quota exceeded and storage unavailable errors with user-friendly messages
- [ ] T029 [US2] Add unsaved changes warning before page navigation using beforeunload event
- [ ] T030 [US2] Update document timestamps (created, modified) on save operations

**Checkpoint**: At this point, User Story 2 should be fully functional - users can save documents and they persist across browser restarts

---

## Phase 5: User Story 3 - Browse and Open Saved Documents (Priority: P3)

**Goal**: Users can view a list of all saved documents and select one to open for editing

**Independent Test**: Save multiple documents, click the "Files" button to view the file list, click on a document name, and verify it opens in the editor with correct content

### Implementation for User Story 3

- [ ] T031 [P] [US3] Create FileList component in src/components/FileList.js with list rendering, document-selected event, and empty state UI
- [ ] T032 [US3] Add Files button to toolbar in public/index.html to toggle file list view
- [ ] T033 [US3] Implement file list toggle functionality in src/app.js showing/hiding FileList component
- [ ] T034 [US3] Load and display document metadata in FileList using storageService.listDocuments
- [ ] T035 [US3] Implement document selection handler in src/app.js loading document content via storageService.getDocument
- [ ] T036 [US3] Update editor and preview with loaded document content
- [ ] T037 [US3] Highlight currently active document in FileList component
- [ ] T038 [US3] Implement sort functionality for file list (by name, by date) with toggle controls
- [ ] T039 [US3] Add search/filter input to FileList component for filename filtering
- [ ] T040 [US3] Style file list items in public/styles.css with filename, timestamps, and file size display
- [ ] T041 [US3] Handle empty state with "No documents yet" message and prompt to create first document

**Checkpoint**: At this point, User Story 3 should be fully functional - users can browse and open any saved document

---

## Phase 6: User Story 4 - Delete Documents (Priority: P4)

**Goal**: Users can remove documents they no longer need from storage

**Independent Test**: Select a document from the list, click delete, confirm the action in the confirmation dialog, and verify the document is removed from both the list and storage

### Implementation for User Story 4

- [ ] T042 [P] [US4] Create DeleteConfirmation component in src/components/DeleteConfirmation.js with modal dialog, filename display, and confirm/cancel events
- [ ] T043 [US4] Add delete button to each file list item in FileList component with delete-requested event
- [ ] T044 [US4] Implement delete workflow in src/app.js: show DeleteConfirmation, handle confirmation, call storageService.deleteDocument
- [ ] T045 [US4] Refresh FileList after successful deletion to remove deleted document from UI
- [ ] T046 [US4] Clear editor if deleted document was currently open
- [ ] T047 [US4] Add visual feedback during delete operation (loading indicator)
- [ ] T048 [US4] Handle delete errors with user-friendly error messages
- [ ] T049 [US4] Style DeleteConfirmation modal in public/styles.css with overlay and centered dialog

**Checkpoint**: All user stories should now be independently functional - complete CRUD operations for documents

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final polish

- [ ] T050 [P] Add "New Document" button to toolbar creating blank document in src/app.js
- [ ] T051 [P] Implement responsive mobile layout in public/styles.css with tabbed editor/preview view
- [ ] T052 [P] Add keyboard shortcuts: Ctrl+S for save, Ctrl+N for new document
- [ ] T053 [P] Implement storage quota monitoring displaying warning at 80% capacity
- [ ] T054 [P] Add loading states and transitions for smoother UX across all components
- [ ] T055 [P] Optimize performance for large documents (>50KB) using requestIdleCallback for rendering
- [ ] T056 [P] Add app header with title and version info in public/index.html
- [ ] T057 [P] Implement dark mode toggle (optional enhancement) in public/styles.css
- [ ] T058 Code cleanup: remove console.logs, add JSDoc comments to functions
- [ ] T059 Verify all edge cases from spec.md are handled with appropriate error messages
- [ ] T060 Run quickstart.md validation steps to verify basic flow works end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Requires US1 Editor component but is independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Integrates with US2 storage but is independently testable
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Depends on US3 FileList component but is independently testable

### Within Each User Story

- UI components before integration
- Component creation before event wiring
- Core functionality before error handling
- Basic features before enhancements (sort, search, etc.)
- Story complete before moving to next priority

### Parallel Opportunities

- **Setup Phase**: T004-T008 can all run in parallel
- **Foundational Phase**: T009-T010 can run in parallel; T011-T013 can run in parallel after T009
- **User Story 1**: T014-T015 can run in parallel
- **User Story 2**: T021 can start in parallel with integration work
- **User Story 3**: T031-T032 can run in parallel
- **User Story 4**: T042-T043 can run in parallel
- **Polish Phase**: Almost all tasks (T050-T057) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch UI components together:
Task: "Create Editor component in src/components/Editor.js"
Task: "Create Preview component in src/components/Preview.js"

# Then integrate sequentially:
Task: "Implement debounced preview update logic in src/app.js"
Task: "Integrate Editor and Preview components in src/app.js"
```

---

## Parallel Example: Foundational Phase

```bash
# Launch foundational models and utilities together:
Task: "Create Document model class in src/models/Document.js"
Task: "Create dateFormatter utility in src/utils/dateFormatter.js"

# Then launch services together:
Task: "Implement validationService in src/services/validationService.js"
Task: "Implement storageService in src/services/storageService.js"
Task: "Implement markdownService in src/services/markdownService.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T008)
2. Complete Phase 2: Foundational (T009-T013) - CRITICAL
3. Complete Phase 3: User Story 1 (T014-T020)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Open editor, type markdown, verify real-time preview
   - Test all markdown syntax types
   - Check performance (<100ms preview updates)
5. Deploy/demo if ready - users can create and edit markdown documents!

### Incremental Delivery

1. **Foundation** (Phase 1+2) → Project structure and services ready
2. **MVP** (+ Phase 3) → Add User Story 1 → Test independently → Deploy/Demo
   - Users can now create and preview markdown documents
3. **Persistence** (+ Phase 4) → Add User Story 2 → Test independently → Deploy/Demo
   - Users can now save and retrieve documents
4. **Document Management** (+ Phase 5) → Add User Story 3 → Test independently → Deploy/Demo
   - Users can now browse and open multiple documents
5. **Full CRUD** (+ Phase 6) → Add User Story 4 → Test independently → Deploy/Demo
   - Users have complete document management capabilities
6. **Polish** (+ Phase 7) → Final enhancements → Final deploy

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (Phase 1+2)
2. Once Foundational is done:
   - Developer A: User Story 1 (Phase 3)
   - Developer B: User Story 2 (Phase 4) - starts slightly after A finishes Editor component
   - Developer C: Polish tasks that don't depend on stories
3. Sequential integration as stories complete

---

## Task Count Summary

- **Phase 1 (Setup)**: 8 tasks
- **Phase 2 (Foundational)**: 5 tasks
- **Phase 3 (US1 - MVP)**: 7 tasks
- **Phase 4 (US2)**: 10 tasks
- **Phase 5 (US3)**: 11 tasks
- **Phase 6 (US4)**: 8 tasks
- **Phase 7 (Polish)**: 11 tasks

**Total**: 60 tasks

**Parallel opportunities**: 20+ tasks can run in parallel (marked with [P])

**MVP scope**: Phase 1-3 (20 tasks) delivers a working markdown editor with real-time preview

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label (US1, US2, US3, US4) maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests are NOT included as they were not requested in the specification
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- This is a frontend-only application - no backend/API tasks needed
- All storage is browser LocalStorage - no database setup required
- Mobile-responsive design is included in US1 layout and Phase 7 polish
