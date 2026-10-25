# Software Requirements Specification — CollabBoard MVP

> Draft starter. The team must review it against the actual application before submission.

## 1. Purpose
CollabBoard MVP is a browser-based collaborative whiteboard intended to let participants sketch ideas in a shared room.

## 2. Scope
**Included in this MVP:** joining a room by ID, drawing freehand strokes, choosing a colour, a basic eraser tool, clearing the canvas, and live room-presence updates.

**Excluded / future work:** authentication, durable board storage, video calls, AI summaries, Google Drive export, access control, offline support, and production deployment hardening.

## 3. Functional requirements
| ID | Requirement | Priority | Status |
|---|---|---|---|
| FR-01 | A participant shall join a room using a valid room ID and display name. | Must | Verify |
| FR-02 | A participant shall draw freehand strokes on the canvas. | Must | Verify |
| FR-03 | Drawing strokes shall be broadcast to other connected participants in the same room. | Must | Verify |
| FR-04 | A participant shall choose a drawing colour. | Should | Verify |
| FR-05 | A participant shall clear the board for all connected participants. | Should | Verify |
| FR-06 | The application shall display connected participants in a room. | Should | Verify |

## 4. Non-functional requirements
| ID | Requirement | Verification |
|---|---|---|
| NFR-01 | Room IDs shall be validated before joining. | Invalid-input test |
| NFR-02 | API credentials shall not be stored in source code. | Repository secret scan |
| NFR-03 | The application shall document installation and run commands. | Fresh-clone check |
| NFR-04 | Normal drawing interactions should be responsive on a local network. | Manual two-browser observation; record measured result |

## 5. Open questions
- Confirm actual browser and operating-system support.
- Confirm whether board persistence is required in a later increment.
- Replace every Verify status with the observed state after testing.
