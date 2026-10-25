# CollabBoard — CodeRangers SEPM MVP

A minimal real-time collaborative whiteboard MVP built with Next.js, TypeScript, a custom Node.js server, and Socket.IO.

## Implemented scope (verify before submission)
- Room join using a room ID and display name
- Freehand canvas strokes and colour selection
- Basic white-colour eraser tool
- Clear-board event
- Connected participant list
- Socket.IO event relay between participants in a room

## Known limitations
- Board contents are held in each browser and are not persisted or replayed for late joiners.
- No authentication or role-based permissions.
- The eraser paints white strokes; it is not object-level erasing.
- Video calling, AI summaries, Google Drive export, offline mode, and production deployment are not implemented in this MVP.
- This is an academic prototype, not a production-hardened service.

## Prerequisites
- Node.js 20 or newer (LTS recommended)
- npm

## Setup
```bash
npm install
```

Copy `.env.example` to `.env.local` if you need to change the default port or host. Do not commit `.env.local`.

## Run locally
```bash
npm run dev
```
Open http://localhost:3000 and choose the demo room. Open the same room URL in a second browser or private window and join with a different display name.

## Checks
```bash
npm test
npm run build
```
Run both commands and record the actual output before reporting results. A successful unit test does not prove that multi-browser synchronization works; perform the manual tests in `docs/05_Testing/Test_Cases.md`.

## Structure
- `server.js` — custom Next.js server and Socket.IO event handling
- `src/app/` — Next.js pages and global styling
- `src/components/BoardRoom.tsx` — board UI and client socket events
- `tests/` — small Node.js test suite
- `docs/` — draft requirements, diagrams, test plan and project-management templates
- `sample_data/` — sample metadata; no persistent board storage is implemented

## Team and academic integrity
Update project history, contribution records, dates, and AI-use disclosure with facts confirmed by all four team members. The project builds on ideas from an earlier CollabBoard hackathon project; disclose any reused code, assets, or design and identify the original project in the report.

## Before pushing
```bash
git status
git diff --check
git diff --cached
```
Ensure no secrets, `.env.local`, `node_modules`, `.next`, or private data are staged.
