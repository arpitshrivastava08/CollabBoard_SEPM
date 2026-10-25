import Link from "next/link";

export default function Home() {
  return (
    <main className="landing">
      <div className="brand"><span className="brand-mark">C</span><span>CollabBoard</span></div>
      <section className="hero">
        <p className="eyebrow">CODERANGERS · SEPM MVP</p>
        <h1>Ideas get better<br /><span>when shared.</span></h1>
        <p className="subhead">A simple real-time whiteboard for teams to sketch, brainstorm and build ideas together.</p>
        <Link className="primary-button" href="/room/demo-room">Open demo room <span aria-hidden="true">↗</span></Link>
        <div className="feature-row">
          <div><strong>01</strong><span>Shared canvas</span></div>
          <div><strong>02</strong><span>Live collaboration</span></div>
          <div><strong>03</strong><span>Room presence</span></div>
        </div>
      </section>
      <footer>Built by CodeRangers · Academic MVP · Features subject to current implementation</footer>
    </main>
  );
}
