import { useState, useMemo } from "react";

const PHASES = [
  { id: "kickoff", label: "Kickoff Call", owner: "client", days: 0, fixed: true },
  { id: "concepts", label: "Influencer Concepts & Script Due", owner: "influencer", days: 3, fixed: false },
  { id: "clientScript", label: "Client Script Feedback Due", owner: "client", days: 2, fixed: true },
  { id: "reviseScript", label: "Influencer Revised Script Due", owner: "influencer", days: 2, fixed: true },
  { id: "filming", label: "R1 Content Due", owner: "influencer", days: 5, fixed: false, slider: true },
  { id: "clientR1", label: "Client Review R1 Due", owner: "client", days: 2, fixed: true },
  { id: "influencerR1Revisions", label: "Influencer R1 Revisions Due", owner: "influencer", days: 2, fixed: false },
  { id: "clientR2", label: "Client Review R2 Due", owner: "client", days: 1, fixed: true },
  { id: "influencerR2Revisions", label: "Influencer R2 Revisions Due", owner: "influencer", days: 1, fixed: false },
  { id: "finalApproval", label: "Client Final Approval Due", owner: "client", days: 1, fixed: true },
];

const C = {
  bg: "#ffffff", bgCard: "#f7f5f2", borderLight: "#eeebe6", border: "#e0dbd5",
  text: "#111111", textMid: "#555555", textMuted: "#999999",
  purple: "#8B7BB5", purpleLight: "#ede9f6", amber: "#ffab40", amberLight: "#fff3e0", track: "#e0dbd5",
};

const DAY_NAMES = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];

function formatDate(date) {
  return `${DAY_NAMES[date.getDay()]}, ${date.getMonth() + 1}/${date.getDate()}`;
}
function isWeekend(date) { const d = date.getDay(); return d === 0 || d === 6; }
function addBusinessDays(date, days) {
  let result = new Date(date), added = 0;
  while (added < days) { result.setDate(result.getDate() + 1); if (!isWeekend(result)) added++; }
  return result;
}
function addAllDays(date, days) { let r = new Date(date); r.setDate(r.getDate() + days); return r; }
function nudgeToWeekday(date, preferWed = false) {
  let d = new Date(date);
  if (d.getDay() === 0) d.setDate(d.getDate() + 1);
  if (d.getDay() === 6) d.setDate(d.getDate() + 2);
  if (d.getDay() === 4 && preferWed) d.setDate(d.getDate() - 1);
  return d;
}
function computeTimeline(kickoffDate, phaseDays) {
  const timeline = []; let current = new Date(kickoffDate);
  for (let i = 0; i < PHASES.length; i++) {
    const phase = PHASES[i], days = phaseDays[phase.id] ?? phase.days;
    if (i === 0) { let d = nudgeToWeekday(current); timeline.push({ ...phase, date: new Date(d), days }); current = new Date(d); continue; }
    let deliveryDate = phase.owner === "influencer"
      ? nudgeToWeekday(addAllDays(current, days))
      : nudgeToWeekday(addBusinessDays(current, days), true);
    timeline.push({ ...phase, date: new Date(deliveryDate), days }); current = new Date(deliveryDate);
  }
  return timeline;
}
function getTodayString() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`;
}

export default function ForwardTimeline() {
  const [kickoff, setKickoff] = useState(getTodayString());
  const [filmingDays, setFilmingDays] = useState(5);
  const [campaignName, setCampaignName] = useState("");
  const [copied, setCopied] = useState(false);

  const phaseDays = useMemo(() => { const b = {}; PHASES.forEach(p => { b[p.id] = p.days; }); b.filming = filmingDays; return b; }, [filmingDays]);
  const kickoffDateObj = useMemo(() => { const [y,m,d] = kickoff.split("-").map(Number); return new Date(y,m-1,d); }, [kickoff]);
  const timeline = useMemo(() => computeTimeline(kickoffDateObj, phaseDays), [kickoffDateObj, phaseDays]);
  const totalDays = useMemo(() => { if (timeline.length < 2) return 0; return Math.round((timeline[timeline.length-1].date - timeline[0].date) / 86400000); }, [timeline]);

  const copyText = () => {
    const lines = timeline.map(p => `${formatDate(p.date)} — ${p.label}`).join("\n");
    const header = campaignName ? `${campaignName}\n${"─".repeat(campaignName.length)}\n` : "";
    const textarea = document.createElement("textarea");
    textarea.value = header + lines; textarea.style.position = "fixed"; textarea.style.opacity = "0";
    document.body.appendChild(textarea); textarea.focus(); textarea.select();
    try { document.execCommand("copy"); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch(e) {}
    document.body.removeChild(textarea);
  };

  const barStart = timeline[0]?.date, barEnd = timeline[timeline.length-1]?.date, totalSpan = barEnd - barStart || 1;

  return (
    <div style={{ fontFamily: "Georgia, serif", background: C.bg, minHeight: "100vh", color: C.text }}>
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "32px 40px 24px" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.2em", color: C.purple, marginBottom: "8px", textTransform: "uppercase" }}>Campaign Timeline Generator</div>
        <h1 style={{ fontSize: "28px", fontWeight: "400", margin: "0 0 4px", letterSpacing: "-0.02em" }}>Influencer Content Schedule</h1>
        <div style={{ fontSize: "13px", color: C.textMuted }}>Set kickoff date · Timeline cascades forward</div>
      </div>

      <div style={{ padding: "32px 40px", maxWidth: "900px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "36px" }}>
          <div>
            <label style={{ fontSize: "10px", letterSpacing: "0.15em", color: C.textMuted, textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Campaign Name</label>
            <input type="text" value={campaignName} onChange={e => setCampaignName(e.target.value)} placeholder="e.g. Spring Launch 2026"
              style={{ width: "100%", background: C.bgCard, border: `1px solid ${C.border}`, color: C.text, padding: "10px 12px", fontSize: "14px", fontFamily: "inherit", borderRadius: "2px", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: "10px", letterSpacing: "0.15em", color: C.textMuted, textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Kickoff Date</label>
            <input type="date" value={kickoff} onChange={e => setKickoff(e.target.value)}
              style={{ width: "100%", background: C.bgCard, border: `1px solid ${C.border}`, color: C.text, padding: "10px 12px", fontSize: "14px", fontFamily: "inherit", borderRadius: "2px", outline: "none", boxSizing: "border-box", colorScheme: "light" }} />
          </div>
          <div>
            <label style={{ fontSize: "10px", letterSpacing: "0.15em", color: C.textMuted, textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
              Filming Days — <span style={{ color: C.purple, fontWeight: "600" }}>{filmingDays} days</span>
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingTop: "6px" }}>
              <span style={{ fontSize: "12px", color: C.textMuted }}>5</span>
              <input type="range" min={5} max={8} value={filmingDays} onChange={e => setFilmingDays(Number(e.target.value))} style={{ flex: 1, accentColor: C.purple, cursor: "pointer" }} />
              <span style={{ fontSize: "12px", color: C.textMuted }}>8</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: C.textMuted, marginTop: "2px" }}>
              <span>tight</span><span>comfortable</span><span>spacious</span>
            </div>
          </div>
        </div>

        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: "4px", padding: "24px", marginBottom: "28px" }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.15em", color: C.textMuted, textTransform: "uppercase", marginBottom: "20px" }}>Visual Timeline — {totalDays} calendar days total</div>
          <div style={{ position: "relative", height: "120px", paddingTop: "40px" }}>
            <div style={{ position: "absolute", top: "32px", left: 0, right: 0, height: "2px", background: C.track }} />
            {timeline.map((phase, i) => {
              if (i === timeline.length - 1) return null;
              const next = timeline[i+1];
              const leftPct = ((phase.date - barStart) / totalSpan) * 100;
              const widthPct = ((next.date - phase.date) / totalSpan) * 100;
              return <div key={phase.id} style={{ position: "absolute", top: "26px", left: `${leftPct}%`, width: `${widthPct}%`, height: "14px", background: PHASES[i+1]?.owner === "influencer" ? C.purple : C.amber, opacity: 0.75 }} />;
            })}
            {timeline.map((phase, i) => {
              const leftPct = ((phase.date - barStart) / totalSpan) * 100;
              const dotColor = phase.owner === "influencer" ? C.purple : C.amber;
              return (
                <div key={phase.id} style={{ position: "absolute", left: `${leftPct}%`, transform: "translateX(-50%)" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: dotColor, position: "absolute", top: "28px", left: "50%", transform: "translateX(-50%)", zIndex: 2, border: `2px solid ${C.bg}`, boxShadow: `0 0 0 1px ${dotColor}` }} />
                  <div style={{ position: "absolute", [i%2===0?"bottom":"top"]: i%2===0?"52px":"-16px", left: "50%", transform: "translateX(-50%)", fontSize: "9px", color: C.textMid, whiteSpace: "nowrap", fontFamily: "monospace" }}>{formatDate(phase.date)}</div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: "20px", marginTop: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><div style={{ width: "12px", height: "3px", background: C.purple }} /><span style={{ fontSize: "10px", color: C.textMuted }}>Influencer phase</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><div style={{ width: "12px", height: "3px", background: C.amber }} /><span style={{ fontSize: "10px", color: C.textMuted }}>Client phase</span></div>
          </div>
        </div>

        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: "4px", padding: "24px", marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.15em", color: C.textMuted, textTransform: "uppercase" }}>{campaignName || "Campaign"} · Deadline Schedule</div>
            <button onClick={copyText} style={{ background: copied ? C.purpleLight : C.bg, border: `1px solid ${copied ? C.purple : C.border}`, color: copied ? C.purple : C.textMuted, padding: "6px 14px", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", borderRadius: "2px", fontFamily: "inherit", transition: "all 0.2s" }}>
              {copied ? "✓ Copied" : "Copy All"}
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {timeline.map((phase, i) => {
              const isInfluencer = phase.owner === "influencer";
              const ownerColor = isInfluencer ? C.purple : C.amber;
              return (
                <div key={phase.id} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "12px 0", borderBottom: i < timeline.length-1 ? `1px solid ${C.borderLight}` : "none" }}>
                  <div style={{ fontSize: "10px", color: C.textMuted, fontFamily: "monospace", minWidth: "16px", textAlign: "right" }}>{String(i+1).padStart(2,"0")}</div>
                  <div style={{ fontFamily: "monospace", fontSize: "13px", color: C.text, minWidth: "90px", fontWeight: "700" }}>{formatDate(phase.date)}</div>
                  <div style={{ color: C.border, fontSize: "12px" }}>—</div>
                  <div style={{ fontSize: "14px", color: C.textMid, flex: 1 }}>{phase.label}</div>
                  <div style={{ fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: ownerColor, background: isInfluencer ? C.purpleLight : C.amberLight, padding: "3px 8px", borderRadius: "2px", whiteSpace: "nowrap", fontWeight: "600" }}>
                    {phase.id === "kickoff" ? "both" : isInfluencer ? "talent" : "client"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ fontSize: "11px", color: C.textMuted }}>Influencer phases count all 7 days · Client phases Mon–Fri only · Deliveries always land on weekdays · Wednesday preferred for client reviews</div>
      </div>
    </div>
  );
}
