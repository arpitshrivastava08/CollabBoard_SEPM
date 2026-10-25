"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

type Point = { x: number; y: number };
type Stroke = { id: string; color: string; width: number; points: Point[] };
type User = { id: string; name: string };

const COLORS = ["#111827", "#2563eb", "#dc2626", "#16a34a", "#9333ea", "#f59e0b"];

export default function BoardRoom({ roomId }: { roomId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const currentRef = useRef<Stroke | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [color, setColor] = useState(COLORS[0]);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [status, setStatus] = useState("Connecting…");
  const [message, setMessage] = useState("");

  const drawStroke = useCallback((ctx: CanvasRenderingContext2D, stroke: Stroke, canvas: HTMLCanvasElement) => {
    if (!stroke.points.length) return;
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    ctx.moveTo(stroke.points[0].x * rect.width, stroke.points[0].y * rect.height);
    for (const p of stroke.points.slice(1)) ctx.lineTo(p.x * rect.width, p.y * rect.height);
    if (stroke.points.length === 1) ctx.lineTo(stroke.points[0].x * rect.width + 0.1, stroke.points[0].y * rect.height + 0.1);
    ctx.stroke();
  }, []);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokesRef.current.forEach((stroke) => drawStroke(ctx, stroke, canvas));
    if (currentRef.current) drawStroke(ctx, currentRef.current, canvas);
  }, [drawStroke]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const old = strokesRef.current;
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
      // Stroke coordinates are normalised, so they can be redrawn at the new size.
      // Use CSS-sized drawing coordinates after applying device-pixel scaling.
      redraw();
      strokesRef.current = old;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [redraw]);

  useEffect(() => {
    const socket = io({ reconnection: true });
    socketRef.current = socket;
    socket.on("connect", () => setStatus("Connected"));
    socket.on("disconnect", () => setStatus("Reconnecting…"));
    socket.on("room:joined", ({ users: roomUsers }: { roomId: string; users: User[] }) => {
      setJoined(true);
      setUsers(roomUsers);
      setMessage("");
    });
    socket.on("room:users", (roomUsers: User[]) => setUsers(roomUsers));
    socket.on("room:error", (text: string) => setMessage(text));
    socket.on("board:stroke", (stroke: Stroke) => {
      if (!strokesRef.current.some((s) => s.id === stroke.id)) strokesRef.current.push(stroke);
      redraw();
    });
    socket.on("board:erase", ({ id }: { id: string }) => {
      strokesRef.current = strokesRef.current.filter((s) => s.id !== id);
      redraw();
    });
    socket.on("board:clear", () => {
      strokesRef.current = [];
      currentRef.current = null;
      redraw();
    });
    return () => { socket.disconnect(); socketRef.current = null; };
  }, [redraw]);

  const joinRoom = () => {
    socketRef.current?.emit("room:join", { roomId, name: name.trim() || "Guest" });
  };

  const pointFromEvent = (event: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)), y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)) };
  };

  const pointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!joined) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    currentRef.current = { id: `${socketRef.current?.id || "local"}-${Date.now()}-${Math.random().toString(16).slice(2)}`, color: tool === "eraser" ? "#ffffff" : color, width: tool === "eraser" ? 22 : 3, points: [pointFromEvent(event)] };
    redraw();
  };

  const pointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!currentRef.current || !(event.buttons & 1)) return;
    currentRef.current.points.push(pointFromEvent(event));
    redraw();
  };

  const pointerUp = () => {
    const stroke = currentRef.current;
    if (!stroke) return;
    currentRef.current = null;
    if (tool === "eraser") {
      // White strokes act as an MVP eraser. Explicit undo/erase-by-ID is not implemented.
      strokesRef.current.push(stroke);
    } else {
      strokesRef.current.push(stroke);
    }
    socketRef.current?.emit("board:stroke", stroke);
    redraw();
  };

  const clearBoard = () => {
    strokesRef.current = [];
    currentRef.current = null;
    socketRef.current?.emit("board:clear");
    redraw();
  };

  return (
    <main className="room-page">
      <header className="room-header">
        <a className="brand compact" href="/"><span className="brand-mark">C</span><span>CollabBoard</span></a>
        <div className="room-meta"><span className="status-dot" />{status}<span className="room-id">Room: {roomId}</span></div>
        <a className="back-link" href="/">Exit room</a>
      </header>
      {!joined ? (
        <section className="join-card">
          <p className="eyebrow">COLLABORATION SPACE</p>
          <h1>Join your team’s board</h1>
          <p>Choose a display name and join this room from another browser to test live collaboration.</p>
          <label htmlFor="display-name">Display name</label>
          <input id="display-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Arpit" maxLength={24} onKeyDown={(e) => e.key === "Enter" && joinRoom()} />
          {message && <p className="error-message">{message}</p>}
          <button className="primary-button" onClick={joinRoom}>Join room <span>→</span></button>
          <small>Share this URL with a teammate to join the same room.</small>
        </section>
      ) : (
        <section className="workspace">
          <aside className="sidebar">
            <div className="side-section"><p className="side-label">TOOLS</p>
              <button className={`tool-button ${tool === "pen" ? "selected" : ""}`} onClick={() => setTool("pen")}><span>✎</span> Pen</button>
              <button className={`tool-button ${tool === "eraser" ? "selected" : ""}`} onClick={() => setTool("eraser")}><span>⌫</span> Eraser</button>
            </div>
            <div className="side-section"><p className="side-label">COLOUR</p><div className="swatches">{COLORS.map((c) => <button aria-label={`Choose ${c}`} title={c} key={c} className={`swatch ${color === c ? "active" : ""}`} style={{ backgroundColor: c }} onClick={() => { setColor(c); setTool("pen"); }} />)}</div></div>
            <div className="side-section"><p className="side-label">BOARD</p><button className="tool-button" onClick={clearBoard}><span>⌧</span> Clear canvas</button></div>
            <div className="participants"><p className="side-label">IN THIS ROOM <span>{users.length}</span></p>{users.map((user) => <div className="participant" key={user.id}><span className="avatar">{user.name.slice(0, 1).toUpperCase()}</span><span>{user.name}{user.id === socketRef.current?.id ? " (you)" : ""}</span><i /></div>)}</div>
            <div className="sidebar-note">Changes sync live to other people in this room while they are connected.</div>
          </aside>
          <div className="board-area">
            <div className="board-top"><div><strong>Untitled board</strong><span>Collaborative workspace</span></div><span className="live-pill"><i /> LIVE</span></div>
            <div className="canvas-wrap"><canvas ref={canvasRef} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} aria-label="Collaborative drawing canvas" /></div>
            <div className="board-footer"><span>Draw anywhere on the canvas</span><span>{users.length} participant{users.length === 1 ? "" : "s"} online</span></div>
          </div>
        </section>
      )}
    </main>
  );
}
