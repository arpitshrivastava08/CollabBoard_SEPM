const test = require("node:test");
const assert = require("node:assert/strict");

function validRoomId(value) {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{1,40}$/.test(value);
}

test("accepts room IDs with letters, numbers, hyphens and underscores", () => {
  assert.equal(validRoomId("demo-room_2"), true);
});

test("rejects empty, overly long and unsafe room IDs", () => {
  assert.equal(validRoomId(""), false);
  assert.equal(validRoomId("a".repeat(41)), false);
  assert.equal(validRoomId("room/other"), false);
  assert.equal(validRoomId(null), false);
});
