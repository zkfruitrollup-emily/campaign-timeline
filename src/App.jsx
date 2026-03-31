import { useState } from "react";
import ForwardTimeline from "./ForwardTimeline";
import ReverseTimeline from "./ReverseTimeline";

const C = {
  bg: "#ffffff", border: "#e0dbd5", text: "#111111",
  textMuted: "#999999", purple: "#8B7BB5", purpleLight: "#ede9f6",
};

export default function App() {
  const [tab, setTab] = useState("forward");

  return (
    <div style={{ fontFamily: "Georgia, serif", background: C.bg, minHeight: "100vh" }}>
      {/* Top nav */}
      <div style={{ background: C.bg, borderBottom: `1px solid ${C.border}`, padding: "0 40px", display: "flex", alignItems: "center", gap: "0" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.2em", color: C.textMuted, textTransform: "uppercase", marginRight: "32px", padding: "16px 0" }}>
          Influencer Timeline Tracker
        </div>
        {[
          { id: "forward", label: "Forward Timeline" },
          { id: "reverse", label: "Reverse Timeline" },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "18px 20px 14px",
              fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase",
              color: tab === t.id ? C.purple : C.textMuted,
              borderBottom: tab === t.id ? `2px solid ${C.purple}` : "2px solid transparent",
              fontFamily: "inherit", fontWeight: tab === t.id ? "600" : "400",
              transition: "all 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "forward" ? <ForwardTimeline /> : <ReverseTimeline />}
    </div>
  );
}
