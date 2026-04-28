import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

/* ─────────────────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────────────────── */
const T = {
  lime:    "#C8FF00",
  limeDim: "#8ab000",
  cyan:    "#00F5FF",
  orange:  "#FF6B35",
  pink:    "#FF3CAC",
  violet:  "#7B2FFF",
  bg:      "#05020f",
  g0:      "rgba(255,255,255,0.0)",
  g1:      "rgba(255,255,255,0.04)",
  g2:      "rgba(255,255,255,0.07)",
  g3:      "rgba(255,255,255,0.11)",
  border:  "rgba(255,255,255,0.08)",
  border2: "rgba(200,255,0,0.22)",
  text:    "#ffffff",
  muted:   "#4a4a4a",
  muted2:  "#2a2a2a",
};

/* ─────────────────────────────────────────────────────────
   GLOBAL CSS
───────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root { --lime: #C8FF00; --cyan: #00F5FF; --orange: #FF6B35; }
body { background: #05020f; color: #fff; font-family: 'Syne', sans-serif; -webkit-font-smoothing: antialiased; }

/* ── AURORA BACKGROUND ── */
@keyframes aurora1 { 0%,100%{transform:translate(0,0) scale(1) rotate(0deg);}  33%{transform:translate(80px,-60px) scale(1.15) rotate(8deg);} 66%{transform:translate(-40px,80px) scale(0.9) rotate(-5deg);} }
@keyframes aurora2 { 0%,100%{transform:translate(0,0) scale(1) rotate(0deg);}  33%{transform:translate(-70px,50px) scale(1.2) rotate(-10deg);} 66%{transform:translate(90px,-70px) scale(0.95) rotate(6deg);} }
@keyframes aurora3 { 0%,100%{transform:translate(0,0) scale(1) rotate(0deg);}  50%{transform:translate(50px,90px) scale(1.1) rotate(12deg);} }
@keyframes aurora4 { 0%,100%{transform:translate(0,0) scale(1);}  40%{transform:translate(-90px,-50px) scale(1.25);} 80%{transform:translate(60px,40px) scale(0.85);} }
@keyframes aurora5 { 0%,100%{transform:translate(0,0) scale(1);}  50%{transform:translate(70px,-80px) scale(1.3);} }
@keyframes meshRotate { from{transform:rotate(0deg) scale(2);} to{transform:rotate(360deg) scale(2);} }
@keyframes particleDrift { 0%{transform:translateY(100vh) translateX(0) scale(0); opacity:0;} 10%{opacity:.6;} 90%{opacity:.3;} 100%{transform:translateY(-20px) translateX(40px) scale(1); opacity:0;} }
@keyframes gridPulse { 0%,100%{opacity:.4;} 50%{opacity:.7;} }
@keyframes hueShift { from{filter:hue-rotate(0deg);} to{filter:hue-rotate(360deg);} }
input[type=number]::-webkit-inner-spin-button { opacity: .2; }
::-webkit-scrollbar { width: 3px; height: 3px; }
::-webkit-scrollbar-thumb { background: rgba(200,255,0,0.2); border-radius: 2px; }
::placeholder { color: #2d2d2d; }

/* 3D card foundation */
.card-3d {
  background: linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%);
  backdrop-filter: blur(24px) saturate(1.4);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  box-shadow:
    0 1px 0 rgba(255,255,255,0.08) inset,
    0 -1px 0 rgba(0,0,0,0.5) inset,
    0 20px 60px rgba(0,0,0,0.6),
    0 4px 16px rgba(0,0,0,0.4);
  position: relative;
  overflow: hidden;
  transition: transform .2s ease, box-shadow .2s ease;
}
.card-3d::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
  border-radius: 20px 20px 0 0;
}
.card-3d:hover {
  transform: translateY(-2px);
  box-shadow: 0 1px 0 rgba(255,255,255,0.1) inset, 0 -1px 0 rgba(0,0,0,0.5) inset,
    0 28px 80px rgba(0,0,0,0.7), 0 8px 24px rgba(0,0,0,0.5);
}

/* Glow variants */
.glow-lime  { box-shadow: 0 0 0 1px rgba(200,255,0,0.3), 0 0 24px rgba(200,255,0,0.12), 0 20px 60px rgba(0,0,0,0.6) !important; }
.glow-cyan  { box-shadow: 0 0 0 1px rgba(0,245,255,0.3), 0 0 24px rgba(0,245,255,0.12), 0 20px 60px rgba(0,0,0,0.6) !important; }
.glow-orange{ box-shadow: 0 0 0 1px rgba(255,107,53,0.3), 0 0 24px rgba(255,107,53,0.12), 0 20px 60px rgba(0,0,0,0.6) !important; }

/* Inputs */
.input-3d {
  background: rgba(0,0,0,0.6);
  border: 1px solid rgba(255,255,255,0.06);
  border-bottom: 1px solid rgba(200,255,0,0.25);
  border-radius: 8px 8px 0 0;
  color: #fff; outline: none; width: 100%;
  font-family: 'DM Mono', monospace;
  transition: border-color .2s;
}
.input-3d:focus { border-bottom-color: var(--lime); box-shadow: 0 2px 0 rgba(200,255,0,0.5); }

.btn-primary {
  background: linear-gradient(135deg, #C8FF00, #8ab000);
  color: #000; border: none; border-radius: 12px;
  font-family: 'Syne', sans-serif; font-weight: 800; letter-spacing: 2px;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(200,255,0,0.3), 0 1px 0 rgba(255,255,255,0.3) inset;
  transition: all .2s;
}
.btn-primary:hover {
  background: linear-gradient(135deg, #d4ff1a, #9dbf00);
  box-shadow: 0 6px 28px rgba(200,255,0,0.5), 0 1px 0 rgba(255,255,255,0.3) inset;
  transform: translateY(-1px);
}
.btn-ghost {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.5);
  border-radius: 10px; cursor: pointer;
  font-family: 'Syne', sans-serif; font-weight: 600; letter-spacing: 1px;
  transition: all .15s;
}
.btn-ghost:hover { background: rgba(255,255,255,0.08); border-color: rgba(200,255,0,0.25); color: var(--lime); }
.btn-ghost-active { background: rgba(200,255,0,0.1) !important; border-color: rgba(200,255,0,0.4) !important; color: var(--lime) !important; }

/* Progress bar */
.pbar-track { background: rgba(255,255,255,0.05); border-radius: 100px; overflow: hidden; position: relative; }
.pbar-fill  {
  height: 100%; border-radius: 100px;
  background: linear-gradient(90deg, #8ab000, #C8FF00);
  box-shadow: 0 0 8px rgba(200,255,0,0.6);
  transition: width .5s cubic-bezier(.4,0,.2,1);
  position: relative;
}
.pbar-fill::after {
  content: ''; position: absolute; top: 0; right: 0; bottom: 0; width: 20px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4));
  border-radius: 100px;
}

/* Set row */
.set-row {
  display: grid; grid-template-columns: 26px 1fr 1fr 28px;
  gap: 6px; align-items: center;
  background: rgba(0,0,0,0.5);
  border: 1px solid rgba(255,255,255,0.04);
  border-radius: 10px; padding: 8px 10px;
  transition: border-color .2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.03) inset;
}
.set-row:focus-within { border-color: rgba(200,255,0,0.2); }

/* Chip */
.chip {
  font-family: 'DM Mono', monospace; font-size: 10px;
  border-radius: 100px; padding: 3px 10px; letter-spacing: .8px;
  border: 1px solid transparent; transition: all .15s;
}
.chip-prev {
  background: rgba(200,255,0,0.06);
  border-color: rgba(200,255,0,0.15);
  color: rgba(200,255,0,0.65);
}

/* Section label */
.section-label {
  font-family: 'DM Mono', monospace; font-size: 9px;
  letter-spacing: 3px; color: #333; text-transform: uppercase;
}

/* Thumb */
.thumb-container {
  position: relative; border-radius: 12px; overflow: hidden;
  background: rgba(0,0,0,0.7);
  border: 1px dashed rgba(255,255,255,0.08);
  cursor: pointer; transition: border-color .2s;
  box-shadow: 0 4px 16px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.04) inset;
}
.thumb-container:hover { border-color: rgba(200,255,0,0.35); }
.thumb-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.75);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity .2s;
}
.thumb-container:hover .thumb-overlay { opacity: 1; }

/* Nav tab */
.nav-tab {
  font-family: 'Syne', sans-serif; font-weight: 700;
  font-size: 11px; letter-spacing: 2px;
  border-radius: 10px; border: none; cursor: pointer;
  padding: 8px 16px; transition: all .15s;
}

/* Tooltip */
.recharts-tooltip-wrapper .custom-tooltip {
  background: rgba(10,10,10,0.95) !important;
  border: 1px solid rgba(200,255,0,0.25) !important;
  border-radius: 10px !important;
  font-family: 'DM Mono', monospace !important;
  font-size: 11px !important;
}

/* Animations */
@keyframes fadeUp   { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
@keyframes pulseRing{ 0%,100%{box-shadow:0 0 0 0 rgba(200,255,0,0.3);} 50%{box-shadow:0 0 0 6px rgba(200,255,0,0);} }
@keyframes bgDrift1 { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(60px,-40px) scale(1.1);} }
@keyframes bgDrift2 { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(-50px,60px) scale(1.15);} }
@keyframes dotScan  { from{opacity:0;transform:scaleX(0);} to{opacity:1;transform:scaleX(1);} }
@keyframes timerBlink { 0%,100%{opacity:1;} 50%{opacity:.5;} }
.fadeup  { animation: fadeUp .35s cubic-bezier(.4,0,.2,1) both; }
.timer-live { animation: timerBlink 1s ease-in-out infinite; }
`;

/* ─────────────────────────────────────────────────────────
   LS HELPERS
───────────────────────────────────────────────────────── */
const LS = {
  get:    (k, fb = null)  => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } },
  set:    (k, v)          => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  getStr: (k, fb = "")   => { try { return localStorage.getItem(k) || fb; } catch { return fb; } },
  setStr: (k, v)          => { try { localStorage.setItem(k, v); } catch {} },
};

/* ─────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────── */
const SPLITS = {
  PUSH:     { label: "PUSH",     sub: "Chest · Shoulder · Triceps", emoji: "💥", color: T.lime },
  PULL:     { label: "PULL",     sub: "Back · Biceps",               emoji: "🔗", color: T.cyan },
  LOWER:    { label: "LOWER",    sub: "Legs · Abs",                  emoji: "⚡", color: T.orange },
  CARDIO:   { label: "CARDIO",   sub: "Treadmill",                   emoji: "🏃", color: T.pink },
  WELLNESS: { label: "WELLNESS", sub: "Yoga · Mobility",             emoji: "🧘", color: T.violet },
};

const DEFAULT_EX = {
  PUSH: [
    {id:"px0",name:"INCLINE BENCH PRESS",     sets:4,reps:10,unit:"lb"},
    {id:"px1",name:"FLAT DUMBBELL PRESS",      sets:4,reps:10,unit:"lb"},
    {id:"px2",name:"CABLE CHEST FLY",          sets:3,reps:12,unit:"lb"},
    {id:"px3",name:"CONVERGING CHEST PRESS",   sets:3,reps:10,unit:"lb"},
    {id:"px4",name:"DUMBBELL SHOULDER PRESS",  sets:4,reps:10,unit:"lb"},
    {id:"px5",name:"SIDE LATERAL RAISE",       sets:4,reps:12,unit:"lb"},
    {id:"px6",name:"ARNOLD PRESS",             sets:3,reps:10,unit:"lb"},
    {id:"px7",name:"TRICEP ROPE PULLDOWN",     sets:4,reps:12,unit:"lb"},
    {id:"px8",name:"TRICEP DUMBBELL PUSHDOWN", sets:3,reps:12,unit:"lb"},
    {id:"px9",name:"TRICEP MACHINE",           sets:3,reps:12,unit:"lb"},
  ],
  PULL: [
    {id:"bx0",name:"BARBELL ROW",        sets:4,reps:12,unit:"lb"},
    {id:"bx1",name:"LAT PULLDOWN",       sets:5,reps:12,unit:"lb"},
    {id:"bx2",name:"SEATED CABLE ROW",   sets:3,reps:12,unit:"lb"},
    {id:"bx3",name:"LOW ROW",            sets:4,reps:10,unit:"lb"},
    {id:"bx4",name:"LEVER ROW",          sets:2,reps:10,unit:"lb"},
    {id:"bx5",name:"REVERSE FLY",        sets:2,reps:12,unit:"lb"},
    {id:"bx6",name:"BARBELL CURL",       sets:4,reps:10,unit:"lb"},
    {id:"bx7",name:"PREACHER CURL",      sets:4,reps:10,unit:"lb"},
    {id:"bx8",name:"REVERSE CURL",       sets:3,reps:12,unit:"lb"},
    {id:"bx9",name:"HAMMER CURL",        sets:3,reps:12,unit:"lb"},
  ],
  LOWER: [
    {id:"lx0",name:"BARBELL SQUAT",       sets:4,reps:8, unit:"lb"},
    {id:"lx1",name:"LEG PRESS",           sets:4,reps:10,unit:"lb"},
    {id:"lx2",name:"LEG EXTENSION",       sets:4,reps:12,unit:"lb"},
    {id:"lx3",name:"LEG CURL",            sets:3,reps:12,unit:"lb"},
    {id:"lx4",name:"ROMANIAN DEADLIFT",   sets:3,reps:12,unit:"lb"},
    {id:"lx5",name:"HANGING LEG RAISES",  sets:3,reps:15,unit:"reps"},
    {id:"lx6",name:"CABLE CRUNCH",        sets:3,reps:15,unit:"lb"},
    {id:"lx7",name:"OBLIQUE TWIST",       sets:3,reps:15,unit:"reps"},
  ],
  CARDIO: [],
  WELLNESS: [
    {id:"wx0",name:"SUN SALUTATION",    sets:3,reps:5, unit:"rounds"},
    {id:"wx1",name:"WARRIOR SEQUENCE",  sets:3,reps:5, unit:"rounds"},
    {id:"wx2",name:"HIP FLEXOR HOLD",   sets:2,reps:60,unit:"sec"},
    {id:"wx3",name:"PIGEON POSE",       sets:2,reps:60,unit:"sec"},
    {id:"wx4",name:"SPINAL TWIST",      sets:2,reps:45,unit:"sec"},
    {id:"wx5",name:"SAVASANA",          sets:1,reps:300,unit:"sec"},
  ],
};

const CARDIO_FIELDS = [
  {key:"duration",label:"DURATION",unit:"min",icon:"⏱"},
  {key:"distance",label:"DISTANCE",unit:"mi", icon:"📏"},
  {key:"calories",label:"CALORIES",unit:"kcal",icon:"🔥"},
  {key:"speed",   label:"AVG SPEED",unit:"mph",icon:"💨"},
  {key:"incline", label:"INCLINE",  unit:"%",  icon:"⛰"},
  {key:"heart",   label:"HEART RATE",unit:"bpm",icon:"❤"},
];

const fmtSecs = s => `${String(Math.floor(s/3600)).padStart(2,"0")}:${String(Math.floor(s%3600/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
const todayISO = () => new Date().toISOString().split("T")[0];

/* ─────────────────────────────────────────────────────────
   COMPONENT: Thumbnail
───────────────────────────────────────────────────────── */
function Thumbnail({ exId, compact = false }) {
  const key = `thumb_${exId}`;
  const [src, setSrc] = useState(() => LS.getStr(key, ""));
  const ref = useRef();

  const handleFile = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { LS.setStr(key, ev.target.result); setSrc(ev.target.result); };
    reader.readAsDataURL(file);
  };

  const h = compact ? 72 : 110;

  return (
    <div className="thumb-container" style={{ height: h }} onClick={() => ref.current.click()}>
      {src ? (
        <img src={src} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
      ) : (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:6 }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="2" y="6" width="28" height="20" rx="3" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" fill="none"/>
            <circle cx="11" cy="13" r="3" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" fill="none"/>
            <path d="M2 22l7-7 5 5 5-5 8 8" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
          </svg>
          <span style={{ fontSize:9, color:"#2a2a2a", fontFamily:"'DM Mono',monospace", letterSpacing:1 }}>TAP TO ADD PHOTO</span>
        </div>
      )}
      <div className="thumb-overlay">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke={T.lime} strokeWidth="1.5"/>
          <path d="M12 8v8M8 12h8" stroke={T.lime} strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <input ref={ref} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFile}/>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   COMPONENT: ProgressChart
───────────────────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label, color }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background:"rgba(8,8,8,0.97)", border:`1px solid ${color}44`,
      borderRadius:10, padding:"10px 14px",
      fontFamily:"'DM Mono',monospace", fontSize:11,
      boxShadow:`0 0 20px ${color}22`,
    }}>
      <div style={{ color:"#555", marginBottom:4, letterSpacing:1 }}>{label}</div>
      {payload.map((p,i) => (
        <div key={i} style={{ color:p.color, fontWeight:500 }}>{p.name}: <span style={{ color:"#fff" }}>{p.value}{p.unit||""}</span></div>
      ))}
    </div>
  );
};

function ProgressChart({ exName, color = T.lime, unit = "lb" }) {
  const [range, setRange] = useState("30D");
  const allLogs = LS.get("il_session_logs", []);

  const data = useMemo(() => {
    const now = Date.now();
    const days = range === "7D" ? 7 : range === "30D" ? 30 : 365;
    const cutoff = now - days * 86400000;
    const filtered = allLogs
      .filter(l => new Date(l.date).getTime() >= cutoff && l.exName === exName)
      .sort((a,b) => new Date(a.date) - new Date(b.date));
    // Aggregate by date: max weight
    const byDate = {};
    filtered.forEach(l => {
      if (!byDate[l.date] || l.maxWeight > byDate[l.date].weight)
        byDate[l.date] = { date: l.date.slice(5), weight: l.maxWeight, volume: l.volume };
    });
    return Object.values(byDate);
  }, [allLogs, exName, range]);

  const ranges = ["7D","30D","ALL"];

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:13, letterSpacing:1 }}>PROGRESS</div>
          <div style={{ fontSize:9, color:"#333", fontFamily:"'DM Mono',monospace", letterSpacing:1, marginTop:2 }}>MAX WEIGHT OVER TIME</div>
        </div>
        <div style={{ display:"flex", gap:4 }}>
          {ranges.map(r => (
            <button key={r} className={`btn-ghost chip ${range===r?"btn-ghost-active":""}`}
              style={{ padding:"4px 10px", fontSize:10 }}
              onClick={() => setRange(r)}>{r}</button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <div style={{ height:120, display:"flex", alignItems:"center", justifyContent:"center", color:"#222", fontFamily:"'DM Mono',monospace", fontSize:11, letterSpacing:1 }}>
          NO DATA YET — LOG SOME SETS
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={130}>
          <LineChart data={data} margin={{ top:4, right:4, bottom:0, left:-20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
            <XAxis dataKey="date" tick={{ fill:"#333", fontSize:9, fontFamily:"'DM Mono',monospace" }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fill:"#333", fontSize:9, fontFamily:"'DM Mono',monospace" }} axisLine={false} tickLine={false}/>
            <Tooltip content={<CustomTooltip color={color} unit={unit}/>}/>
            <Line type="monotone" dataKey="weight" name="Weight" unit={unit}
              stroke={color} strokeWidth={2.5} dot={{ fill:color, r:3, strokeWidth:0 }}
              activeDot={{ r:5, fill:color, stroke:T.bg, strokeWidth:2 }}/>
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   COMPONENT: SetRow
───────────────────────────────────────────────────────── */
function SetRowComp({ num, weight, reps, unit, color, onChange, onRemove, isLast }) {
  return (
    <div className="set-row">
      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, fontWeight:500, color, textAlign:"center" }}>
        {String(num).padStart(2,"0")}
      </span>
      {[["WT",unit,weight,"weight"],["REPS","x",reps,"reps"]].map(([lbl,ph,val,field])=>(
        <div key={field}>
          <div style={{ fontSize:8, color:"#2d2d2d", letterSpacing:1, fontFamily:"'DM Mono',monospace", marginBottom:3, textAlign:"center" }}>{lbl}</div>
          <input type="number" value={val} placeholder="—" className="input-3d"
            style={{ fontSize:18, fontWeight:700, textAlign:"center", padding:"6px 4px", borderRadius:6 }}
            onChange={e => onChange(field, e.target.value)}/>
        </div>
      ))}
      <button onClick={onRemove} style={{
        background:"transparent", border:"none", color: isLast ? "#1a1a1a" : "#2d2d2d",
        cursor: isLast ? "not-allowed" : "pointer", fontSize:16, transition:"color .15s", paddingTop:12,
      }} disabled={isLast}>×</button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   COMPONENT: ExerciseCard
───────────────────────────────────────────────────────── */
function ExerciseCard({ ex, split, color, sessionSets, onSetsChange, onExChange, prevRecord, idx }) {
  const [open, setOpen] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const sets = sessionSets || Array.from({ length: ex.sets }, () => ({ weight:"", reps:"" }));
  const logged = sets.filter(s => s.weight || s.reps).length;
  const pct    = Math.round(logged / ex.sets * 100);
  const done   = logged === ex.sets;

  const updateSet = (i, field, val) => {
    const ns = [...sets]; ns[i] = { ...ns[i], [field]: val }; onSetsChange(ns);
  };
  const addSet    = () => onSetsChange([...sets, { weight:"", reps:"" }]);
  const removeSet = i  => onSetsChange(sets.filter((_,j) => j !== i));

  return (
    <div className={`card-3d ${done ? "glow-lime" : ""}`}
      style={{ marginBottom:10, overflow:"hidden",
        borderColor: done ? "rgba(200,255,0,0.35)" : "rgba(255,255,255,0.06)" }}>

      {/* Thumbnail */}
      <Thumbnail exId={ex.id} compact={!open}/>

      {/* Header */}
      <div style={{ padding:"12px 14px" }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
          {/* Completion ring */}
          <div style={{
            width:38, height:38, borderRadius:"50%", flexShrink:0,
            background: `conic-gradient(${done?color:color} ${pct*3.6}deg, rgba(255,255,255,0.05) 0deg)`,
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow: done ? `0 0 12px ${color}44` : "none",
            transition:"all .4s",
          }}>
            <div style={{
              width:28, height:28, borderRadius:"50%",
              background:"rgba(0,0,0,0.9)",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              {done
                ? <span style={{ fontSize:14, color }}>✓</span>
                : <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:"#555" }}>{pct}%</span>
              }
            </div>
          </div>

          <div style={{ flex:1, minWidth:0 }}>
            {/* Editable name */}
            <input value={ex.name}
              onChange={e => onExChange({ ...ex, name: e.target.value.toUpperCase() })}
              onClick={e => e.stopPropagation()}
              style={{
                background:"transparent", border:"none",
                borderBottom:"1px solid rgba(255,255,255,0.06)",
                color:"#fff", fontSize:14, fontFamily:"'Syne',sans-serif",
                fontWeight:800, letterSpacing:1.5, outline:"none", width:"100%",
                paddingBottom:2, transition:"border-color .2s",
              }}
              onFocus={e => e.target.style.borderBottomColor = color}
              onBlur={e => e.target.style.borderBottomColor = "rgba(255,255,255,0.06)"}
            />

            {/* Prev record */}
            {prevRecord
              ? <div className="chip chip-prev" style={{ marginTop:5, display:"inline-flex", alignItems:"center", gap:4 }}>
                  <span style={{ opacity:.5 }}>PREV</span>
                  <span style={{ color }}>
                    {prevRecord.weight}{ex.unit} · {prevRecord.reps}×{prevRecord.sets}
                  </span>
                  <span style={{ opacity:.35, fontSize:8 }}>{prevRecord.date}</span>
                </div>
              : <div style={{ fontSize:9, color:"#222", fontFamily:"'DM Mono',monospace", marginTop:5, letterSpacing:.8 }}>
                  NO PREVIOUS RECORD
                </div>
            }

            <div style={{ fontSize:8, color:"#2a2a2a", fontFamily:"'DM Mono',monospace", marginTop:4, letterSpacing:.5 }}>
              TARGET: {ex.sets}×{ex.reps} · {ex.unit}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            <button onClick={() => setOpen(!open)} className="btn-ghost"
              style={{ padding:"6px 10px", fontSize:11, transform: open?"rotate(180deg)":"none", transition:"transform .2s" }}>▾</button>
            <button onClick={() => setShowChart(!showChart)} className={`btn-ghost ${showChart?"btn-ghost-active":""}`}
              style={{ padding:"6px 8px", fontSize:11 }}>📊</button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="pbar-track" style={{ height:3, marginTop:10 }}>
          <div className="pbar-fill" style={{ width:`${pct}%`,
            background: done ? `linear-gradient(90deg,${color}88,${color})` : `linear-gradient(90deg, ${color}44,${color}88)` }}/>
        </div>
      </div>

      {/* Sets expanded */}
      {open && (
        <div style={{ padding:"0 14px 14px", display:"flex", flexDirection:"column", gap:6 }}>
          <div className="section-label" style={{ marginBottom:6 }}>SETS</div>
          {sets.map((s,i) => (
            <SetRowComp key={i} num={i+1} weight={s.weight} reps={s.reps} unit={ex.unit}
              color={color} isLast={sets.length===1}
              onChange={(f,v) => updateSet(i,f,v)}
              onRemove={() => removeSet(i)}/>
          ))}
          <div style={{ display:"flex", gap:6, marginTop:4 }}>
            <button className="btn-ghost" style={{ flex:1, padding:"8px", fontSize:11, letterSpacing:1 }} onClick={addSet}>+ SET</button>
            <button className="btn-ghost" style={{ flex:1, padding:"8px", fontSize:11, letterSpacing:1, color:"#555" }}
              onClick={() => {
                const ns = sets.map(s=>({ weight: prevRecord?.weight||"", reps: prevRecord?.reps||"" }));
                onSetsChange(ns);
              }}>↩ FILL PREV</button>
          </div>
          {/* Inline edit sets/reps targets */}
          <div style={{ display:"flex", gap:8, marginTop:6 }}>
            {[["DEFAULT SETS",ex.sets,"sets"],["DEFAULT REPS",ex.reps,"reps"]].map(([lbl,val,field])=>(
              <div key={field} style={{ flex:1, background:"rgba(0,0,0,0.4)", borderRadius:8, padding:"8px 10px", border:"1px solid rgba(255,255,255,0.04)" }}>
                <div className="section-label" style={{ marginBottom:4 }}>{lbl}</div>
                <input type="number" value={val} className="input-3d"
                  style={{ fontSize:16, padding:"4px 6px", borderRadius:6 }}
                  onChange={e => onExChange({ ...ex, [field]: +e.target.value })}/>
              </div>
            ))}
          </div>
          <textarea placeholder="Notes…" value={ex.notes||""}
            onChange={e => onExChange({ ...ex, notes: e.target.value })}
            rows={2} style={{
              background:"rgba(0,0,0,0.5)", border:"1px solid rgba(255,255,255,0.04)",
              borderRadius:8, color:"#666", fontSize:11, padding:"8px 10px",
              resize:"none", outline:"none", fontFamily:"'DM Mono',monospace",
              marginTop:4, transition:"border-color .2s",
            }}
            onFocus={e=>e.target.style.borderColor="rgba(200,255,0,0.15)"}
            onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.04)"}/>
        </div>
      )}

      {/* Chart */}
      {showChart && (
        <div style={{ padding:"0 14px 14px",
          borderTop:"1px solid rgba(255,255,255,0.04)" }}>
          <ProgressChart exName={ex.name} color={color} unit={ex.unit}/>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   COMPONENT: CardioPanel
───────────────────────────────────────────────────────── */
function CardioPanel({ data, onChange, color }) {
  const pace = (data.distance>0 && data.duration>0) ? (data.duration/data.distance).toFixed(1) : null;
  const cpm  = (data.distance>0 && data.calories>0) ? Math.round(data.calories/data.distance)  : null;

  return (
    <div>
      <div className="card-3d glow-pink" style={{ padding:"18px", marginBottom:12,
        background:"linear-gradient(135deg, rgba(255,60,172,0.1) 0%, rgba(255,60,172,0.03) 100%)",
        borderColor:"rgba(255,60,172,0.25)" }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:900, fontSize:20, letterSpacing:3, color }}>
          🏃 TREADMILL SESSION
        </div>
        <div className="section-label" style={{ marginTop:4 }}>LOG YOUR CARDIO METRICS</div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
        {CARDIO_FIELDS.map(f => (
          <div key={f.key} className="card-3d" style={{ padding:"14px" }}>
            <div style={{ fontSize:13, marginBottom:4 }}>{f.icon}</div>
            <div className="section-label" style={{ marginBottom:6 }}>{f.label}</div>
            <div style={{ display:"flex", alignItems:"baseline", gap:4 }}>
              <input type="number" value={data[f.key]||""} placeholder="0"
                onChange={e=>onChange(f.key,e.target.value)}
                style={{
                  background:"transparent", border:"none",
                  borderBottom:`1.5px solid ${color}55`,
                  color:"#fff", fontSize:28, fontFamily:"'Syne',sans-serif",
                  fontWeight:800, outline:"none", width:"100%", padding:"2px 0",
                  transition:"border-color .2s",
                }}
                onFocus={e=>e.target.style.borderBottomColor=color}
                onBlur={e=>e.target.style.borderBottomColor=`${color}55`}/>
              <span style={{ fontSize:9, color:"#333", whiteSpace:"nowrap", fontFamily:"'DM Mono',monospace" }}>{f.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {(pace||cpm) && (
        <div className="card-3d" style={{ padding:"14px 16px", marginBottom:12,
          borderColor:"rgba(255,60,172,0.3)", background:"rgba(255,60,172,0.06)" }}>
          <div className="section-label" style={{ color, marginBottom:10 }}>⚡ AUTO-CALCULATED</div>
          <div style={{ display:"flex", gap:24 }}>
            {pace&&<div>
              <div className="section-label" style={{ marginBottom:4 }}>PACE</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:28, color }}>{pace} <span style={{ fontSize:11 }}>min/mi</span></div>
            </div>}
            {cpm&&<div>
              <div className="section-label" style={{ marginBottom:4 }}>CAL/MILE</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:28, color }}>{cpm} <span style={{ fontSize:11 }}>kcal</span></div>
            </div>}
          </div>
        </div>
      )}

      {/* Cardio progress chart */}
      <div className="card-3d" style={{ padding:"14px 16px", marginBottom:12 }}>
        <ProgressChart exName="__CARDIO_DISTANCE__" color={color} unit="mi"/>
      </div>

      <div className="card-3d" style={{ padding:"14px 16px" }}>
        <div className="section-label" style={{ marginBottom:8 }}>SESSION NOTES</div>
        <textarea placeholder="Intervals, incline changes, heart rate zones…"
          value={data.notes||""} onChange={e=>onChange("notes",e.target.value)}
          rows={3} style={{
            width:"100%", background:"transparent", border:"none",
            color:"#777", fontSize:12, outline:"none",
            resize:"none", fontFamily:"'DM Mono',monospace",
          }}/>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   COMPONENT: AnalyticsDashboard
───────────────────────────────────────────────────────── */
function AnalyticsDashboard({ logs, exercises }) {
  const [catFilter,   setCatFilter]   = useState("ALL");
  const [range,       setRange]       = useState("ALL");
  const [sortMode,    setSortMode]    = useState("NEWEST");
  const [search,      setSearch]      = useState("");
  const [expandedDate,setExpandedDate]= useState(null);

  const now   = Date.now();
  const today = todayISO();

  const filtered = useMemo(() => {
    const days = range==="7D"?7:range==="30D"?30:99999;
    const cutoff = now - days*86400000;
    return Object.keys(logs)
      .filter(d => {
        const dl = logs[d]||{};
        const dw = Object.keys(dl);
        return new Date(d).getTime()>=cutoff
          && (catFilter==="ALL"||dw.includes(catFilter))
          && (!search||(d.includes(search)||dw.some(c=>c.toLowerCase().includes(search.toLowerCase()))));
      })
      .sort((a,b) => {
        if(sortMode==="NEWEST")return b.localeCompare(a);
        if(sortMode==="OLDEST")return a.localeCompare(b);
        return Object.keys(logs[b]||{}).length-Object.keys(logs[a]||{}).length;
      });
  }, [logs, catFilter, range, sortMode, search]);

  // Aggregates
  let totalSets=0, totalMins=0, totalCals=0, totalMiles=0;
  const catCount={};
  filtered.forEach(d=>{
    Object.entries(logs[d]||{}).forEach(([cat,data])=>{
      catCount[cat]=(catCount[cat]||0)+1;
      if(cat==="CARDIO"&&data.cardio){
        totalMins +=+data.cardio.duration||0;
        totalCals +=+data.cardio.calories||0;
        totalMiles+=+data.cardio.distance||0;
      } else {
        Object.values(data).forEach(v=>{
          if(Array.isArray(v)) totalSets+=v.filter(s=>s.weight||s.reps).length;
        });
      }
    });
  });
  const favCat = Object.entries(catCount).sort((a,b)=>b[1]-a[1])[0];

  const last7vol = useMemo(()=>{
    return Array.from({length:7},(_,i)=>{
      const d=new Date(); d.setDate(d.getDate()-6+i);
      const k=d.toISOString().split("T")[0];
      const dow=d.toLocaleDateString("en-US",{weekday:"short"}).slice(0,2).toUpperCase();
      const n=Object.keys(logs[k]||{}).length;
      return {k,dow,n};
    });
  },[logs]);

  const statCards=[
    {l:"SESSIONS",v:filtered.length, u:"total",  ico:"📅",c:T.lime},
    {l:"SETS",    v:totalSets,       u:"logged", ico:"💪",c:T.cyan},
    {l:"CARDIO",  v:Math.round(totalMins),u:"min",ico:"🏃",c:T.pink},
    {l:"CALORIES",v:Math.round(totalCals),u:"kcal",ico:"🔥",c:T.orange},
    {l:"MILES",   v:totalMiles.toFixed(1),u:"run",ico:"📏",c:T.violet},
    {l:"TOP SPLIT",v:favCat?favCat[0].split(" ")[0]:"—",u:favCat?`${favCat[1]}×`:"",ico:"⭐",c:"#FFD700"},
  ];

  return (
    <div style={{ padding:"14px 16px 0" }}>
      {/* Search */}
      <div className="card-3d" style={{ padding:"10px 14px", marginBottom:10, display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:14, opacity:.4 }}>⌕</span>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search date or category…"
          style={{ flex:1, background:"transparent", border:"none", color:"#fff", fontSize:13, outline:"none", fontFamily:"'DM Mono',monospace" }}/>
      </div>

      {/* Filter row */}
      <div style={{ display:"flex", gap:5, marginBottom:8, overflowX:"auto", paddingBottom:2 }}>
        {[{l:"ALL",v:"ALL"},{l:"7D",v:"7D"},{l:"30D",v:"30D"}].map(r=>(
          <button key={r.v} className={`btn-ghost chip ${range===r.v?"btn-ghost-active":""}`}
            onClick={()=>setRange(r.v)}>{r.l}</button>
        ))}
        <div style={{ width:1, background:"rgba(255,255,255,0.06)", flexShrink:0, margin:"0 4px" }}/>
        {["NEWEST","OLDEST","MOST VOL"].map(s=>(
          <button key={s} className={`btn-ghost chip ${sortMode===s?"btn-ghost-active":""}`}
            onClick={()=>setSortMode(s)}>{s}</button>
        ))}
      </div>

      {/* Cat filter */}
      <div style={{ display:"flex", gap:5, marginBottom:16, overflowX:"auto", paddingBottom:2 }}>
        {["ALL",...Object.keys(SPLITS)].map(c=>{
          const col=SPLITS[c]?.color||T.lime;
          const active=catFilter===c;
          return (
            <button key={c} onClick={()=>setCatFilter(c)}
              className={`btn-ghost chip`}
              style={active?{background:`${col}18`,borderColor:col,color:col}:{}}>
              {c==="ALL"?`⚡ ALL`:`${SPLITS[c].emoji} ${c}`}
            </button>
          );
        })}
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:16 }}>
        {statCards.map(s=>(
          <div key={s.l} className="card-3d" style={{ padding:"12px 8px", textAlign:"center" }}>
            <div style={{ fontSize:18, marginBottom:3 }}>{s.ico}</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color:s.c, lineHeight:1,
              textShadow:`0 0 16px ${s.c}44` }}>{s.v}</div>
            <div style={{ fontSize:8, color:"#2d2d2d", fontFamily:"'DM Mono',monospace", letterSpacing:.8 }}>{s.u}</div>
            <div style={{ fontSize:7, color:"#222", fontFamily:"'DM Mono',monospace", letterSpacing:.8, marginTop:2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* 7-day volume bar */}
      <div className="card-3d" style={{ padding:"14px 16px", marginBottom:14 }}>
        <div className="section-label" style={{ marginBottom:12 }}>WEEKLY FREQUENCY</div>
        <div style={{ display:"flex", gap:6, alignItems:"flex-end", height:56 }}>
          {last7vol.map(({k,dow,n})=>{
            const isToday=k===today;
            return (
              <div key={k} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                <div style={{
                  width:"100%", borderRadius:"4px 4px 2px 2px", transition:"height .4s cubic-bezier(.4,0,.2,1)",
                  height:n>0?Math.max(8,n*16):4,
                  background:n>0?`linear-gradient(180deg,${T.lime},${T.limeDim})`:"rgba(255,255,255,0.04)",
                  boxShadow:n>0?`0 0 10px ${T.lime}44, 0 -2px 0 rgba(255,255,255,0.1) inset`:"none",
                }}/>
                <div style={{ fontSize:8, color:isToday?"#fff":"#2d2d2d", fontWeight:isToday?700:400,
                  fontFamily:"'DM Mono',monospace" }}>{dow}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Volume trend chart */}
      <div className="card-3d" style={{ padding:"14px 16px", marginBottom:14 }}>
        <div className="section-label" style={{ marginBottom:8 }}>SESSIONS PER WEEK (30D)</div>
        <ResponsiveContainer width="100%" height={90}>
          <BarChart data={last7vol} margin={{top:0,right:0,bottom:0,left:-20}}>
            <XAxis dataKey="dow" tick={{fill:"#333",fontSize:8,fontFamily:"'DM Mono',monospace"}} axisLine={false} tickLine={false}/>
            <YAxis hide/>
            <Tooltip content={<CustomTooltip color={T.lime}/>}/>
            <Bar dataKey="n" name="Sessions" fill={T.lime} radius={[4,4,2,2]}
              opacity={.8}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Session list */}
      <div className="section-label" style={{ marginBottom:10 }}>{filtered.length} SESSION{filtered.length!==1?"S":""}</div>

      {filtered.length===0?(
        <div className="card-3d" style={{ padding:"40px 20px", textAlign:"center", color:"#1a1a1a" }}>
          <div style={{ fontSize:40, marginBottom:10 }}>📋</div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, letterSpacing:2 }}>NO SESSIONS FOUND</div>
        </div>
      ):filtered.map(date=>{
        const dl=logs[date]||{};
        const dw=Object.keys(dl);
        const isToday=date===today;
        const isOpen=expandedDate===date;
        return (
          <div key={date} className="card-3d" style={{ marginBottom:10, overflow:"hidden",
            borderLeft:`2px solid ${isToday?T.lime:"rgba(255,255,255,0.06)"}` }}>
            <div onClick={()=>setExpandedDate(isOpen?null:date)}
              style={{ display:"flex", alignItems:"center", padding:"14px 16px", cursor:"pointer", gap:10 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:14, letterSpacing:1.5, display:"flex", alignItems:"center", gap:8 }}>
                  {new Date(date+"T00:00:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}).toUpperCase()}
                  {isToday&&<span style={{
                    background:"rgba(200,255,0,0.1)", border:"1px solid rgba(200,255,0,0.3)",
                    borderRadius:100, padding:"2px 8px", fontSize:8, color:T.lime,
                    fontFamily:"'DM Mono',monospace", letterSpacing:1,
                  }}>TODAY</span>}
                </div>
                <div className="section-label" style={{ marginTop:3 }}>
                  {dw.length} SPLIT{dw.length!==1?"S":""}
                </div>
              </div>
              <div style={{ display:"flex", gap:4 }}>
                {dw.map(d=>(
                  <span key={d} style={{ fontSize:18,
                    filter:`drop-shadow(0 0 6px ${SPLITS[d]?.color||"#fff"}aa)` }}>
                    {SPLITS[d]?.emoji||"🏋️"}
                  </span>
                ))}
              </div>
              <span style={{ color:"#2d2d2d", fontSize:14, transform:isOpen?"rotate(180deg)":"none", transition:"transform .2s" }}>▾</span>
            </div>

            {isOpen&&(
              <div style={{ padding:"0 16px 14px", borderTop:"1px solid rgba(255,255,255,0.04)" }}>
                {dw.map(cat=>{
                  const col=SPLITS[cat]?.color||T.lime;
                  const ed=dl[cat]||{};
                  return (
                    <div key={cat} style={{ marginTop:14 }}>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:12, letterSpacing:2, color:col, marginBottom:8 }}>
                        {SPLITS[cat]?.emoji} {cat}
                      </div>
                      {cat==="CARDIO"&&ed.cardio?(
                        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                          {[["⏱",ed.cardio.duration,"min"],["📏",ed.cardio.distance,"mi"],["🔥",ed.cardio.calories,"kcal"],["💨",ed.cardio.speed,"mph"]].map(([ic,v,u])=>v?(
                            <div key={u} className="card-3d" style={{ padding:"8px 12px", textAlign:"center", minWidth:60 }}>
                              <div style={{ fontSize:13 }}>{ic}</div>
                              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, color:col }}>{v}</div>
                              <div style={{ fontSize:8, color:"#2d2d2d" }}>{u}</div>
                            </div>
                          ):null)}
                        </div>
                      ):(
                        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                          {Object.entries(ed).filter(([k])=>!isNaN(k)).map(([i,sets])=>{
                            if(!Array.isArray(sets)||!sets.some(s=>s.weight||s.reps))return null;
                            const exList=exercises[cat]||DEFAULT_EX[cat]||[];
                            const exName=exList[+i]?.name||`Ex ${+i+1}`;
                            const valid=sets.filter(s=>s.weight||s.reps);
                            return (
                              <div key={i} style={{
                                background:"rgba(0,0,0,0.4)", borderRadius:8,
                                padding:"7px 12px", display:"flex", justifyContent:"space-between", alignItems:"center",
                                border:"1px solid rgba(255,255,255,0.03)",
                              }}>
                                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#3d3d3d", letterSpacing:.8 }}>{exName}</span>
                                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:col, fontWeight:500 }}>
                                  {valid.map(s=>`${s.weight||0}lb×${s.reps||0}`).join("  ")}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   ROOT: FitnessDashboard
───────────────────────────────────────────────────────── */
export default function FitnessDashboard() {
  const [view,        setView]        = useState("log");   // log | analytics
  const [activeSplit, setActiveSplit] = useState(null);
  const [userName,    setUserName]    = useState(() => LS.getStr("il_name","ATHLETE"));
  const [editName,    setEditName]    = useState(false);
  const [exercises,   setExercises]   = useState(() => LS.get("il_exercises_v4", DEFAULT_EX));
  const [logs,        setLogs]        = useState(() => LS.get("il_logs_v4", {}));
  const [sessionStart,setSessionStart]= useState(null);
  const [elapsed,     setElapsed]     = useState(0);
  const [savedMsg,    setSavedMsg]    = useState(false);
  const timerRef = useRef(null);
  const today    = todayISO();

  /* Timer */
  useEffect(()=>{
    clearInterval(timerRef.current);
    if(sessionStart){
      timerRef.current=setInterval(()=>setElapsed(Math.floor((Date.now()-sessionStart)/1000)),1000);
    }
    return ()=>clearInterval(timerRef.current);
  },[sessionStart]);

  /* Persist exercises */
  useEffect(()=>{ LS.set("il_exercises_v4",exercises); },[exercises]);

  /* Select split */
  const handleSelectSplit = split => {
    setActiveSplit(split);
    if(!sessionStart) setSessionStart(Date.now());
    setLogs(prev=>{
      const upd={...prev,[today]:{...(prev[today]||{}),[split]:{...(prev[today]?.[split]||{}),_start:new Date().toISOString()}}};
      LS.set("il_logs_v4",upd); return upd;
    });
  };

  /* Auto-populate: get last record for exercise by name */
  const getPrev = useCallback((split, exIdx)=>{
    const exName = exercises[split]?.[exIdx]?.name;
    if(!exName) return null;
    const past = Object.keys(logs).filter(d=>d!==today).sort().reverse();
    for(const d of past){
      const sets = logs[d]?.[split]?.[exIdx];
      if(Array.isArray(sets)&&sets.some(s=>s.weight||s.reps)){
        const valid=sets.filter(s=>s.weight||s.reps);
        const avgW=(valid.reduce((a,s)=>a+(+s.weight||0),0)/valid.length).toFixed(1);
        const avgR=Math.round(valid.reduce((a,s)=>a+(+s.reps||0),0)/valid.length);
        return { weight:avgW, reps:avgR, sets:valid.length, date:d.slice(5) };
      }
    }
    return null;
  },[logs,exercises,today]);

  /* Update sets */
  const updateSets = (split, idx, sets) => {
    setLogs(prev=>{
      const upd={...prev,[today]:{...(prev[today]||{}),[split]:{...(prev[today]?.[split]||{}),[idx]:sets}}};
      LS.set("il_logs_v4",upd);
      // Append to session history for charts
      const exName=exercises[split]?.[idx]?.name;
      if(exName){
        const hist=LS.get("il_session_logs",[]);
        const valid=sets.filter(s=>s.weight||s.reps);
        if(valid.length){
          const maxW=Math.max(...valid.map(s=>+s.weight||0));
          const vol=valid.reduce((a,s)=>a+(+s.weight||0)*(+s.reps||0),0);
          const existing=hist.findIndex(h=>h.date===today&&h.exName===exName);
          const entry={date:today,exName,maxWeight:maxW,volume:vol};
          if(existing>=0) hist[existing]=entry; else hist.push(entry);
          LS.set("il_session_logs",hist.slice(-500));
        }
      }
      return upd;
    });
  };

  /* Update cardio */
  const updateCardio=(key,val)=>{
    setLogs(prev=>{
      const upd={...prev,[today]:{...(prev[today]||{}),CARDIO:{...(prev[today]?.CARDIO||{}),cardio:{...(prev[today]?.CARDIO?.cardio||{}),[key]:val}}}};
      LS.set("il_logs_v4",upd);
      // Log for chart
      if(key==="distance"&&+val>0){
        const hist=LS.get("il_session_logs",[]);
        const existing=hist.findIndex(h=>h.date===today&&h.exName==="__CARDIO_DISTANCE__");
        const entry={date:today,exName:"__CARDIO_DISTANCE__",maxWeight:+val,volume:+val};
        if(existing>=0)hist[existing]=entry; else hist.push(entry);
        LS.set("il_session_logs",hist.slice(-500));
      }
      return upd;
    });
  };

  /* Update ex meta */
  const updateExMeta=(split,idx,ex)=>{
    setExercises(prev=>{ const u={...prev,[split]:[...prev[split]]};u[split][idx]=ex;return u; });
  };

  /* Save */
  const handleSave=()=>{
    if(activeSplit){
      setLogs(prev=>{
        const upd={...prev,[today]:{...(prev[today]||{}),[activeSplit]:{...(prev[today]?.[activeSplit]||{}),_end:new Date().toISOString(),_duration:Math.round(elapsed/60)}}};
        LS.set("il_logs_v4",upd); return upd;
      });
    }
    setSavedMsg(true); setTimeout(()=>setSavedMsg(false),2200);
  };

  const getProgress=(split)=>{
    const exList=exercises[split]||[];
    if(!exList.length) return 0;
    const total=exList.reduce((a,e)=>a+e.sets,0);
    const done=exList.reduce((acc,ex,i)=>{
      const s=logs[today]?.[split]?.[i];
      return acc+(Array.isArray(s)?s.filter(x=>x.weight||x.reps).length:0);
    },0);
    return total>0?Math.round(done/total*100):0;
  };

  const splitColor = activeSplit?SPLITS[activeSplit].color:T.lime;

  return (
    <div style={{ minHeight:"100vh", background:"transparent", color:"#fff", maxWidth:480, margin:"0 auto", paddingBottom:100, fontFamily:"'Syne',sans-serif", position:"relative" }}>
      <style>{GLOBAL_CSS}</style>

      {/* ── COLORFUL ANIMATED BACKGROUND ── */}
      <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none", overflow:"hidden", background:"#05020f" }}>

        {/* Deep base gradient */}
        <div style={{
          position:"absolute", inset:0,
          background:"radial-gradient(ellipse 80% 60% at 50% 0%, #1a0533 0%, #05020f 70%)",
        }}/>

        {/* Aurora blob 1 — lime/green */}
        <div style={{
          position:"absolute", top:"-10%", left:"-5%",
          width:520, height:520, borderRadius:"60% 40% 70% 30% / 50% 60% 40% 50%",
          background:"radial-gradient(ellipse, rgba(200,255,0,0.22) 0%, rgba(100,255,50,0.08) 50%, transparent 75%)",
          filter:"blur(55px)",
          animation:"aurora1 16s ease-in-out infinite",
        }}/>

        {/* Aurora blob 2 — cyan/blue */}
        <div style={{
          position:"absolute", top:"20%", right:"-10%",
          width:480, height:480, borderRadius:"40% 60% 30% 70% / 60% 40% 60% 40%",
          background:"radial-gradient(ellipse, rgba(0,245,255,0.2) 0%, rgba(0,100,255,0.08) 50%, transparent 75%)",
          filter:"blur(65px)",
          animation:"aurora2 19s ease-in-out infinite",
        }}/>

        {/* Aurora blob 3 — hot pink/magenta */}
        <div style={{
          position:"absolute", bottom:"10%", left:"10%",
          width:420, height:420, borderRadius:"70% 30% 50% 50% / 40% 60% 40% 60%",
          background:"radial-gradient(ellipse, rgba(255,60,172,0.18) 0%, rgba(180,0,255,0.06) 55%, transparent 75%)",
          filter:"blur(70px)",
          animation:"aurora3 22s ease-in-out infinite",
        }}/>

        {/* Aurora blob 4 — orange/amber */}
        <div style={{
          position:"absolute", bottom:"-5%", right:"5%",
          width:380, height:380, borderRadius:"50% 50% 40% 60% / 50% 40% 60% 50%",
          background:"radial-gradient(ellipse, rgba(255,107,53,0.16) 0%, rgba(255,180,0,0.06) 50%, transparent 75%)",
          filter:"blur(60px)",
          animation:"aurora4 25s ease-in-out infinite",
        }}/>

        {/* Aurora blob 5 — violet center */}
        <div style={{
          position:"absolute", top:"50%", left:"40%",
          width:300, height:300, borderRadius:"50%",
          transform:"translate(-50%,-50%)",
          background:"radial-gradient(ellipse, rgba(123,47,255,0.14) 0%, transparent 70%)",
          filter:"blur(50px)",
          animation:"aurora5 12s ease-in-out infinite",
        }}/>

        {/* Split-color reactive blob — top left */}
        <div style={{
          position:"absolute", top:"-20%", left:"-10%",
          width:560, height:560, borderRadius:"50%",
          background:`radial-gradient(circle, ${splitColor}28 0%, transparent 65%)`,
          filter:"blur(75px)",
          transition:"background 1.4s ease",
          animation:"aurora1 14s ease-in-out infinite",
        }}/>

        {/* Split-color reactive blob — bottom right */}
        <div style={{
          position:"absolute", bottom:"-15%", right:"-10%",
          width:600, height:600, borderRadius:"50%",
          background:`radial-gradient(circle, ${splitColor}18 0%, transparent 65%)`,
          filter:"blur(90px)",
          transition:"background 1.4s ease",
          animation:"aurora2 18s ease-in-out infinite",
        }}/>

        {/* Conic sweep layer */}
        <div style={{
          position:"absolute", top:"50%", left:"50%",
          width:1200, height:1200,
          transform:"translate(-50%,-50%) rotate(0deg) scale(2)",
          background:"conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(200,255,0,0.03) 45deg, transparent 90deg, rgba(0,245,255,0.04) 135deg, transparent 180deg, rgba(255,60,172,0.03) 225deg, transparent 270deg, rgba(255,107,53,0.03) 315deg, transparent 360deg)",
          animation:"meshRotate 40s linear infinite",
        }}/>

        {/* Diagonal grid */}
        <div style={{
          position:"absolute", inset:0,
          backgroundImage:"linear-gradient(135deg, rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(45deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
          backgroundSize:"48px 48px",
          animation:"gridPulse 6s ease-in-out infinite",
        }}/>

        {/* Fine dot matrix */}
        <div style={{
          position:"absolute", inset:0,
          backgroundImage:"radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize:"28px 28px",
          opacity:.4,
        }}/>

        {/* Floating particles */}
        {[
          {l:"10%",d:"0s",dur:"8s",c:"rgba(200,255,0,0.7)",s:3},
          {l:"25%",d:"2s",dur:"11s",c:"rgba(0,245,255,0.7)",s:2},
          {l:"45%",d:"4s",dur:"9s", c:"rgba(255,60,172,0.6)",s:4},
          {l:"60%",d:"1s",dur:"13s",c:"rgba(123,47,255,0.7)",s:2},
          {l:"75%",d:"6s",dur:"10s",c:"rgba(255,107,53,0.7)",s:3},
          {l:"88%",d:"3s",dur:"12s",c:"rgba(200,255,0,0.5)",s:2},
          {l:"33%",d:"7s",dur:"14s",c:"rgba(0,245,255,0.5)",s:3},
          {l:"55%",d:"5s",dur:"7s", c:"rgba(255,60,172,0.8)",s:2},
        ].map((p,i)=>(
          <div key={i} style={{
            position:"absolute", bottom:0, left:p.l,
            width:p.s, height:p.s, borderRadius:"50%",
            background:p.c,
            boxShadow:`0 0 ${p.s*4}px ${p.c}`,
            animation:`particleDrift ${p.dur} ${p.d} ease-in infinite`,
          }}/>
        ))}

        {/* Top chromatic glow bar */}
        <div style={{
          position:"absolute", top:0, left:0, right:0, height:2,
          background:`linear-gradient(90deg, transparent 0%, ${T.violet}dd 20%, ${T.cyan}ff 40%, ${splitColor}ff 60%, ${T.pink}dd 80%, transparent 100%)`,
          boxShadow:`0 0 24px ${splitColor}99, 0 0 48px ${splitColor}44`,
          transition:"box-shadow 1.4s",
        }}/>

        {/* Bottom fade vignette */}
        <div style={{
          position:"absolute", bottom:0, left:0, right:0, height:200,
          background:"linear-gradient(0deg, #05020f 0%, transparent 100%)",
        }}/>

        {/* Side vignettes */}
        <div style={{
          position:"absolute", inset:0,
          background:"radial-gradient(ellipse 100% 100% at 50% 50%, transparent 50%, rgba(5,2,15,0.7) 100%)",
        }}/>
      </div>

      {/* ── HEADER ── */}
      <div style={{
        position:"sticky", top:0, zIndex:300,
        background:"rgba(5,2,15,0.75)", backdropFilter:"blur(32px)",
        borderBottom:"1px solid rgba(255,255,255,0.07)",
        padding:"12px 16px",
      }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            {/* Logo mark */}
            <div style={{
              width:40, height:40, borderRadius:12, flexShrink:0,
              background:`linear-gradient(135deg, ${splitColor}, ${splitColor}66)`,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
              boxShadow:`0 0 20px ${splitColor}55, 0 4px 12px rgba(0,0,0,0.5)`,
              transition:"all 1.2s",
            }}>⚡</div>
            <div>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, letterSpacing:4, color:"#2d2d2d" }}>FITNESS DASHBOARD</div>
              {editName?(
                <input value={userName}
                  onChange={e=>setUserName(e.target.value.toUpperCase())}
                  onBlur={()=>{ setEditName(false); LS.setStr("il_name",userName); }}
                  onKeyDown={e=>e.key==="Enter"&&setEditName(false)}
                  autoFocus maxLength={14}
                  style={{
                    background:"transparent", border:"none",
                    borderBottom:`1.5px solid ${splitColor}`,
                    color:"#fff", fontSize:17, fontFamily:"'Syne',sans-serif",
                    fontWeight:800, letterSpacing:2, outline:"none", width:160,
                  }}/>
              ):(
                <div onClick={()=>setEditName(true)} style={{
                  fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:17, letterSpacing:2,
                  cursor:"pointer", display:"flex", alignItems:"center", gap:5,
                  background:`linear-gradient(90deg,#fff 35%,${splitColor})`,
                  WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                  transition:"all 1.2s",
                }}>{userName} <span style={{ fontSize:11, WebkitTextFillColor:splitColor, opacity:.5 }}>✎</span></div>
              )}
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            {/* Live timer */}
            {sessionStart&&(
              <div style={{
                background:"rgba(200,255,0,0.06)", border:"1px solid rgba(200,255,0,0.15)",
                borderRadius:8, padding:"5px 10px",
                fontFamily:"'DM Mono',monospace", fontSize:13, fontWeight:500,
                color:T.lime, letterSpacing:2,
              }} className="timer-live">{fmtSecs(elapsed)}</div>
            )}
            {["LOG","ANALYTICS"].map(v=>(
              <button key={v} className={`nav-tab ${view===v.toLowerCase()?"btn-primary":"btn-ghost"}`}
                style={{ padding:"7px 12px", fontSize:10 }}
                onClick={()=>setView(v.toLowerCase())}>{v}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── LOG VIEW ── */}
      {view==="log"&&(
        <div style={{ padding:"14px 16px 0", position:"relative", zIndex:10 }} className="fadeup">
          {!activeSplit?(
            <div>
              <div style={{ marginBottom:20 }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:30, letterSpacing:2, lineHeight:1 }}>
                  SELECT <span style={{ color:T.lime, textShadow:`0 0 24px ${T.lime}66` }}>SPLIT</span>
                </div>
                <div style={{ fontSize:10, color:"#2d2d2d", fontFamily:"'DM Mono',monospace", marginTop:6, letterSpacing:2 }}>
                  {new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"}).toUpperCase()}
                </div>
              </div>

              {Object.entries(SPLITS).map(([key,split],i)=>{
                const pct=getProgress(key);
                const doneToday=logs[today]?.[key];
                return (
                  <button key={key} className="card-3d"
                    style={{
                      width:"100%", marginBottom:10, padding:"18px", cursor:"pointer",
                      display:"flex", alignItems:"center", gap:14, textAlign:"left",
                      border:`1px solid ${doneToday?"rgba(200,255,0,0.15)":"rgba(255,255,255,0.06)"}`,
                      animation:`fadeUp .3s ease ${i*.05}s both`,
                    }}
                    onClick={()=>handleSelectSplit(key)}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=`${split.color}44`;e.currentTarget.style.transform="translateY(-3px)";}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=doneToday?"rgba(200,255,0,0.15)":"rgba(255,255,255,0.06)";e.currentTarget.style.transform="translateY(-2px)";}}
                  >
                    <div style={{
                      width:54, height:54, borderRadius:16, flexShrink:0,
                      background:`${split.color}18`, border:`1.5px solid ${split.color}33`,
                      display:"flex", alignItems:"center", justifyContent:"center", fontSize:26,
                      boxShadow:`0 0 16px ${split.color}22`,
                    }}>{split.emoji}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, letterSpacing:2,
                        color: doneToday?split.color:"#fff" }}>{split.label}</div>
                      <div style={{ fontSize:10, color:"#2d2d2d", fontFamily:"'DM Mono',monospace", letterSpacing:1, marginTop:3 }}>{split.sub}</div>
                      {pct>0&&(
                        <div style={{ marginTop:8 }}>
                          <div className="pbar-track" style={{ height:3 }}>
                            <div className="pbar-fill" style={{ width:`${pct}%`, background:split.color }}/>
                          </div>
                          <div style={{ fontSize:9, color:split.color, marginTop:3, fontFamily:"'DM Mono',monospace" }}>{pct}% LOGGED</div>
                        </div>
                      )}
                    </div>
                    <div style={{
                      width:32, height:32, borderRadius:10, flexShrink:0,
                      background:`${split.color}18`, border:`1px solid ${split.color}33`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      color:split.color, fontSize:16, fontWeight:700,
                    }}>›</div>
                  </button>
                );
              })}
            </div>
          ):(
            <div>
              {/* Back row */}
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                <button className="btn-ghost" style={{ padding:"8px 12px", fontSize:11, letterSpacing:1 }}
                  onClick={()=>setActiveSplit(null)}>‹ BACK</button>
                <div style={{ flex:1 }}>
                  <div style={{
                    fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, letterSpacing:3,
                    background:`linear-gradient(90deg,#fff 30%,${splitColor})`,
                    WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                  }}>{SPLITS[activeSplit].emoji} {SPLITS[activeSplit].label}</div>
                  <div style={{ fontSize:9, color:"#2d2d2d", fontFamily:"'DM Mono',monospace" }}>
                    {logs[today]?.[activeSplit]?._start
                      ? `STARTED ${new Date(logs[today][activeSplit]._start).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}`
                      : "SESSION ACTIVE"}
                  </div>
                </div>
                {activeSplit!=="CARDIO"&&(
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26,
                      color:splitColor, lineHeight:1, textShadow:`0 0 20px ${splitColor}66` }}>
                      {getProgress(activeSplit)}%
                    </div>
                    <div className="pbar-track" style={{ width:44, marginTop:4 }}>
                      <div className="pbar-fill" style={{ width:`${getProgress(activeSplit)}%`, background:splitColor }}/>
                    </div>
                  </div>
                )}
              </div>

              {activeSplit==="CARDIO"?(
                <CardioPanel data={logs[today]?.CARDIO?.cardio||{}} onChange={updateCardio} color={splitColor}/>
              ):(
                (exercises[activeSplit]||DEFAULT_EX[activeSplit]||[]).map((ex,i)=>(
                  <ExerciseCard key={ex.id||i} ex={ex} split={activeSplit} color={splitColor}
                    sessionSets={logs[today]?.[activeSplit]?.[i]||null}
                    onSetsChange={sets=>updateSets(activeSplit,i,sets)}
                    onExChange={nex=>updateExMeta(activeSplit,i,nex)}
                    prevRecord={getPrev(activeSplit,i)} idx={i}/>
                ))
              )}

              {activeSplit!=="CARDIO"&&(
                <button className="btn-ghost" style={{ width:"100%", padding:"12px", fontSize:11, letterSpacing:2, marginBottom:10 }}
                  onClick={()=>{
                    const newEx={id:`${activeSplit}_${Date.now()}`,name:"NEW EXERCISE",sets:3,reps:10,unit:"lb"};
                    setExercises(prev=>({...prev,[activeSplit]:[...(prev[activeSplit]||[]),newEx]}));
                  }}>+ ADD EXERCISE</button>
              )}

              <button className="btn-primary" style={{ width:"100%", padding:"16px", fontSize:16, letterSpacing:3,
                background: savedMsg?"linear-gradient(135deg,#00C853,#00E676)":undefined,
                boxShadow: savedMsg?"0 4px 24px rgba(0,200,83,0.4)":undefined,
                transition:"all .3s",
              }} onClick={handleSave}>
                {savedMsg?"✓ SESSION SAVED!":"SAVE SESSION"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── ANALYTICS VIEW ── */}
      {view==="analytics"&&(
        <div style={{ position:"relative", zIndex:10 }} className="fadeup">
          <AnalyticsDashboard logs={logs} exercises={exercises}/>
        </div>
      )}
    </div>
  );
}
