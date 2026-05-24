
"use client";

import React, { useEffect, useMemo, useState } from "react";

type IncidentType = "Storm" | "HV Fault" | "LV Cluster" | "Welfare" | "Asset Risk";
type Mode = "mission" | "simulator" | "signals" | "archive";

type Crew = {
  id: string;
  name: string;
  base: string;
  distance: number;
  eta: number;
  fatigue: number;
  skill: string[];
  available: boolean;
};

type Signal = {
  id: string;
  title: string;
  body: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  time: string;
};

const crews: Crew[] = [
  {
    id: "c1",
    name: "Vega-12",
    base: "Basingstoke",
    distance: 7.8,
    eta: 18,
    fatigue: 22,
    skill: ["HV", "Switching", "Faults"],
    available: true,
  },
  {
    id: "c2",
    name: "Orion-04",
    base: "Andover",
    distance: 16.2,
    eta: 32,
    fatigue: 41,
    skill: ["LV", "Customer", "Welfare"],
    available: true,
  },
  {
    id: "c3",
    name: "Atlas-31",
    base: "Reading",
    distance: 21.7,
    eta: 45,
    fatigue: 18,
    skill: ["HV", "Lines", "Storm"],
    available: true,
  },
  {
    id: "c4",
    name: "Nova-09",
    base: "Winchester",
    distance: 12.5,
    eta: 27,
    fatigue: 64,
    skill: ["LV", "Assets", "Repair"],
    available: false,
  },
  {
    id: "c5",
    name: "Lyra-22",
    base: "Portsmouth",
    distance: 33.1,
    eta: 58,
    fatigue: 29,
    skill: ["Storm", "Welfare", "Drone"],
    available: true,
  },
];

const baseSignals: Signal[] = [
  {
    id: "s1",
    title: "Weather edge detected",
    body: "Gust front model suggests a 38% increase in tree-contact risk across the western cell.",
    severity: "Medium",
    time: "14:02",
  },
  {
    id: "s2",
    title: "Customer priority cluster",
    body: "Three PSR-adjacent records sit inside the same estimated low voltage boundary.",
    severity: "High",
    time: "14:07",
  },
  {
    id: "s3",
    title: "Travel time divergence",
    body: "Road routing is now 11 minutes above baseline. Local congestion appears temporary.",
    severity: "Low",
    time: "14:10",
  },
  {
    id: "s4",
    title: "Fatigue guardrail triggered",
    body: "One eligible crew has been deprioritised because their 17-week trend is approaching threshold.",
    severity: "Critical",
    time: "14:13",
  },
];

const archiveItems = [
  {
    year: "Phase 01",
    title: "The first dispatch spark",
    body: "A tiny idea: what if proximity, fatigue, skills, customers and fairness all lived in one calm screen?",
  },
  {
    year: "Phase 02",
    title: "The intelligent layer",
    body: "Routes became scores, scores became explainable, and explainable became something people could trust.",
  },
  {
    year: "Phase 03",
    title: "The human bit",
    body: "The system stopped pretending people were dots on a map and started treating them as crews, colleagues and customers.",
  },
  {
    year: "Phase 04",
    title: "The surprise door",
    body: "You found a page that absolutely did not need to exist, which is precisely why it had to exist.",
  },
];

const missionPrompts = [
  "Build the calmest storm room interface the industry has ever seen.",
  "Design a dispatch score that can explain itself without sounding like corporate soup.",
  "Turn postcode chaos into a map that makes tired people say: yep, that helps.",
  "Create one button that makes a dispatcher feel ten minutes less stressed.",
  "Make fairness visible enough that nobody has to guess why a crew was chosen.",
  "Replace five noisy systems with one screen that feels like it was made by someone who actually listened.",
];

const incidentSkillMap: Record<IncidentType, string[]> = {
  Storm: ["Storm", "Lines", "Drone"],
  "HV Fault": ["HV", "Switching", "Faults"],
  "LV Cluster": ["LV", "Customer", "Repair"],
  Welfare: ["Welfare", "Customer"],
  "Asset Risk": ["Assets", "Drone", "Repair"],
};

const severityStyle: Record<Signal["severity"], string> = {
  Low: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
  Medium: "border-amber-300/30 bg-amber-300/10 text-amber-100",
  High: "border-orange-300/30 bg-orange-300/10 text-orange-100",
  Critical: "border-rose-300/40 bg-rose-300/10 text-rose-100",
};

const modeCopy: Record<Mode, { eyebrow: string; title: string; text: string }> = {
  mission: {
    eyebrow: "Hidden route unlocked",
    title: "ProximityLink Surprise Lab",
    text: "A playful command centre for crews, assets, customers, storm days and beautifully over-engineered ideas.",
  },
  simulator: {
    eyebrow: "Dispatch sandbox",
    title: "Run a pretend incident",
    text: "Pick the scenario and urgency. The page will rank crews using distance, ETA, fatigue, availability and skill fit.",
  },
  signals: {
    eyebrow: "Live signal wall",
    title: "Noise, but useful noise",
    text: "A pretend operational feed that turns small fragments into something calmer and more actionable.",
  },
  archive: {
    eyebrow: "Origin story",
    title: "From spark to system",
    text: "A tiny timeline of the sort of idea that starts as a spreadsheet headache and becomes a proper product.",
  },
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function scoreCrew(crew: Crew, incident: IncidentType, urgency: number) {
  const required = incidentSkillMap[incident];
  const matchingSkills = crew.skill.filter((skill) => required.includes(skill)).length;
  const skillScore = matchingSkills / Math.max(required.length, 1);
  const availabilityScore = crew.available ? 1 : 0.22;
  const distanceScore = Math.max(0, 1 - crew.distance / 45);
  const etaScore = Math.max(0, 1 - crew.eta / 75);
  const fatigueScore = Math.max(0, 1 - crew.fatigue / 100);
  const urgencyBias = urgency / 100;

  return Math.round(
    100 *
      availabilityScore *
      (distanceScore * (0.22 + urgencyBias * 0.12) +
        etaScore * (0.26 + urgencyBias * 0.18) +
        fatigueScore * 0.2 +
        skillScore * 0.32)
  );
}

function getRecommendation(score: number) {
  if (score >= 82) return "Primary pick";
  if (score >= 68) return "Strong backup";
  if (score >= 48) return "Viable";
  return "Avoid unless needed";
}

function Sparkline({ values }: { values: number[] }) {
  const width = 180;
  const height = 48;
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - (value / 100) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-12 w-full overflow-visible">
      <defs>
        <linearGradient id="spark" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="55%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#f0abfc" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke="url(#spark)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
        points={points}
      />
      {values.map((value, index) => {
        const x = (index / (values.length - 1)) * width;
        const y = height - (value / 100) * height;
        return <circle key={index} cx={x} cy={y} r="3" fill="#e9d5ff" />;
      })}
    </svg>
  );
}

function RadarOrb({ active }: { active: boolean }) {
  return (
    <div className="relative mx-auto flex h-72 w-72 items-center justify-center sm:h-96 sm:w-96">
      <div className="absolute inset-0 rounded-full border border-cyan-300/20 bg-cyan-300/5 blur-[1px]" />
      <div className="absolute inset-8 rounded-full border border-fuchsia-300/20" />
      <div className="absolute inset-16 rounded-full border border-emerald-300/20" />
      <div className="absolute inset-24 rounded-full border border-white/10" />
      <div className={cn("radar-sweep absolute inset-2 rounded-full", active && "radar-sweep-fast")} />
      <div className="absolute left-[22%] top-[31%] h-3 w-3 rounded-full bg-cyan-200 shadow-[0_0_22px_rgba(103,232,249,.9)]" />
      <div className="absolute right-[25%] top-[42%] h-2 w-2 rounded-full bg-fuchsia-200 shadow-[0_0_18px_rgba(240,171,252,.9)]" />
      <div className="absolute bottom-[26%] left-[43%] h-4 w-4 rounded-full bg-emerald-200 shadow-[0_0_24px_rgba(110,231,183,.9)]" />
      <div className="absolute bottom-[36%] right-[16%] h-2.5 w-2.5 rounded-full bg-amber-200 shadow-[0_0_20px_rgba(253,230,138,.9)]" />
      <div className="glass-card relative z-10 w-44 rounded-3xl p-5 text-center shadow-2xl">
        <div className="text-4xl">⌁</div>
        <p className="mt-2 text-xs uppercase tracking-[0.35em] text-cyan-100/70">Proximity</p>
        <p className="mt-1 text-2xl font-black text-white">LINK</p>
        <p className="mt-2 text-xs text-slate-300">Signal found inside the chaos.</p>
      </div>
    </div>
  );
}

function StatCard({ label, value, foot, pulse }: { label: string; value: string; foot: string; pulse?: boolean }) {
  return (
    <div className="glass-card rounded-3xl p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
        {pulse && <span className="h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,.8)]" />}
      </div>
      <p className="mt-4 text-3xl font-black tracking-tight text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-300">{foot}</p>
    </div>
  );
}

function ModeButton({ mode, activeMode, setMode, children }: { mode: Mode; activeMode: Mode; setMode: (mode: Mode) => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => setMode(mode)}
      className={cn(
        "rounded-2xl border px-4 py-3 text-sm font-bold transition duration-300",
        activeMode === mode
          ? "border-cyan-200/60 bg-cyan-200/15 text-white shadow-[0_0_28px_rgba(103,232,249,.18)]"
          : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
      )}
    >
      {children}
    </button>
  );
}

function CommandConsole({ onCommand }: { onCommand: (command: string) => void }) {
  const [command, setCommand] = useState("");
  const [history, setHistory] = useState<string[]>(["boot > surprise route warmed", "boot > signal layer online"]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const clean = command.trim();
    if (!clean) return;
    setHistory((current) => [`you > ${clean}`, ...current].slice(0, 6));
    onCommand(clean.toLowerCase());
    setCommand("");
  }

  return (
    <div className="glass-card rounded-3xl p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-fuchsia-100/70">Command line</p>
          <h3 className="mt-1 text-xl font-black text-white">Try: storm, pickle, solace, launch, reset</h3>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-cyan-100">⌘</div>
      </div>
      <form onSubmit={submit} className="mt-5 flex gap-3">
        <input
          value={command}
          onChange={(event) => setCommand(event.target.value)}
          placeholder="Type a secret command..."
          className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-200/60 focus:ring-4 focus:ring-cyan-200/10"
        />
        <button className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-950 transition hover:scale-[1.02] active:scale-[0.98]">
          Run
        </button>
      </form>
      <div className="mt-4 space-y-2 rounded-2xl border border-white/10 bg-black/25 p-4 font-mono text-xs text-slate-300">
        {history.map((item, index) => (
          <p key={`${item}-${index}`} className={index === 0 ? "text-cyan-100" : "text-slate-400"}>
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function SimulatorPanel({ incident, setIncident, urgency, setUrgency }: { incident: IncidentType; setIncident: (incident: IncidentType) => void; urgency: number; setUrgency: (urgency: number) => void }) {
  const ranked = useMemo(() => {
    return [...crews]
      .map((crew) => ({ ...crew, score: scoreCrew(crew, incident, urgency) }))
      .sort((a, b) => b.score - a.score);
  }, [incident, urgency]);

  const best = ranked[0];

  return (
    <div className="grid gap-5 lg:grid-cols-[0.95fr_1.35fr]">
      <div className="glass-card rounded-3xl p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/70">Scenario input</p>
        <h3 className="mt-2 text-2xl font-black text-white">Pretend incident builder</h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          This is not trying to be a real model. It is a tiny interactive proof-of-feel: explainable ranking, not mystery maths.
        </p>

        <div className="mt-6 grid gap-3">
          {(["Storm", "HV Fault", "LV Cluster", "Welfare", "Asset Risk"] as IncidentType[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setIncident(item)}
              className={cn(
                "flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition",
                incident === item
                  ? "border-cyan-200/60 bg-cyan-200/15 text-white"
                  : "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
              )}
            >
              <span className="font-bold">{item}</span>
              <span className="text-xs text-slate-400">{incidentSkillMap[item].join(" / ")}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-white" htmlFor="urgency">
              Urgency
            </label>
            <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-black text-cyan-100">{urgency}%</span>
          </div>
          <input
            id="urgency"
            type="range"
            min="1"
            max="100"
            value={urgency}
            onChange={(event) => setUrgency(Number(event.target.value))}
            className="mt-4 w-full accent-cyan-200"
          />
        </div>

        <div className="mt-5 rounded-3xl border border-emerald-200/20 bg-emerald-200/10 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-emerald-100/70">Recommendation</p>
          <p className="mt-2 text-2xl font-black text-white">{best.name}</p>
          <p className="mt-1 text-sm text-slate-300">
            {best.score}% fit from {best.base}. ETA {best.eta} minutes. Fatigue index {best.fatigue}.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {ranked.map((crew, index) => (
          <div key={crew.id} className="glass-card rounded-3xl p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-black text-white">#{index + 1}</span>
                  <h4 className="text-xl font-black text-white">{crew.name}</h4>
                  {!crew.available && <span className="rounded-full border border-rose-200/30 bg-rose-200/10 px-3 py-1 text-xs font-bold text-rose-100">Busy</span>}
                </div>
                <p className="mt-2 text-sm text-slate-300">
                  {crew.base} · {crew.distance} miles · ETA {crew.eta} mins · fatigue {crew.fatigue}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {crew.skill.map((skill) => (
                    <span
                      key={skill}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs",
                        incidentSkillMap[incident].includes(skill)
                          ? "border-cyan-200/40 bg-cyan-200/10 text-cyan-100"
                          : "border-white/10 bg-white/[0.04] text-slate-400"
                      )}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="min-w-[120px] text-left sm:text-right">
                <p className="text-4xl font-black text-white">{crew.score}</p>
                <p className="text-sm font-bold text-cyan-100">{getRecommendation(crew.score)}</p>
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300" style={{ width: `${crew.score}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SignalsPanel({ stormMode }: { stormMode: boolean }) {
  const signals = useMemo(() => {
    if (!stormMode) return baseSignals;
    return [
      {
        id: "storm",
        title: "Storm mode escalated",
        body: "Synthetic control room has entered dramatic-but-still-safe mode. Extra amber pixels deployed.",
        severity: "Critical" as const,
        time: "NOW",
      },
      ...baseSignals,
    ];
  }, [stormMode]);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
      <div className="space-y-3">
        {signals.map((signal) => (
          <article key={signal.id} className={cn("rounded-3xl border p-5", severityStyle[signal.severity])}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] opacity-75">{signal.severity}</p>
                <h3 className="mt-2 text-xl font-black text-white">{signal.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-200">{signal.body}</p>
              </div>
              <span className="rounded-full bg-black/20 px-3 py-1 font-mono text-xs text-white/80">{signal.time}</span>
            </div>
          </article>
        ))}
      </div>
      <div className="glass-card rounded-3xl p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/70">Network mood</p>
        <h3 className="mt-2 text-2xl font-black text-white">Mostly calm, slightly electric</h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          The signal wall is deliberately human-readable. The goal is not more alerts. The goal is fewer surprises that actually matter.
        </p>
        <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-5">
          <Sparkline values={stormMode ? [22, 35, 45, 72, 89, 81, 93] : [18, 24, 21, 31, 28, 35, 29]} />
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-white/[0.05] p-3">
              <p className="text-2xl font-black text-white">47</p>
              <p className="text-xs text-slate-400">Assets watched</p>
            </div>
            <div className="rounded-2xl bg-white/[0.05] p-3">
              <p className="text-2xl font-black text-white">8</p>
              <p className="text-xs text-slate-400">Routes shifted</p>
            </div>
            <div className="rounded-2xl bg-white/[0.05] p-3">
              <p className="text-2xl font-black text-white">3</p>
              <p className="text-xs text-slate-400">Risks reduced</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArchivePanel() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {archiveItems.map((item, index) => (
        <article key={item.title} className="glass-card group rounded-3xl p-6 transition hover:-translate-y-1 hover:border-cyan-200/30">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-200/20 bg-cyan-200/10 text-lg font-black text-cyan-100">
              {index + 1}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{item.year}</p>
              <h3 className="mt-2 text-xl font-black text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{item.body}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function MissionPanel({ prompt, generatePrompt }: { prompt: string; generatePrompt: () => void }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-fuchsia-100/70">Today&apos;s absurdly serious mission</p>
        <h3 className="mt-4 max-w-3xl text-3xl font-black leading-tight text-white sm:text-4xl">{prompt}</h3>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={generatePrompt}
            className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:scale-[1.02] active:scale-[0.98]"
          >
            Generate new mission
          </button>
          <a
            href="#simulator"
            className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-black text-white transition hover:border-cyan-200/40 hover:bg-cyan-200/10"
          >
            Run dispatch sandbox
          </a>
        </div>
      </div>
      <div className="glass-card rounded-3xl p-6">
        <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/70">Product principles</p>
        <div className="mt-5 space-y-3">
          {["Explain the recommendation", "Protect the tired humans", "Show the customer impact", "Make the map earn its keep", "Reduce panic, not just clicks"].map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-200/10 text-cyan-100">✓</span>
              <span className="text-sm font-bold text-slate-200">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FloatingConfetti({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {Array.from({ length: 42 }).map((_, index) => (
        <span
          key={index}
          className="confetti-piece absolute h-3 w-3 rounded-sm"
          style={{
            left: `${(index * 23) % 100}%`,
            animationDelay: `${(index % 9) * 0.08}s`,
            background: ["#67e8f9", "#a78bfa", "#f0abfc", "#fde68a", "#86efac"][index % 5],
          }}
        />
      ))}
    </div>
  );
}

export default function SurprisePage() {
  const [mode, setMode] = useState<Mode>("mission");
  const [incident, setIncident] = useState<IncidentType>("HV Fault");
  const [urgency, setUrgency] = useState(72);
  const [stormMode, setStormMode] = useState(false);
  const [catMode, setCatMode] = useState(false);
  const [softMode, setSoftMode] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      setTime(
        new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }).format(new Date())
      );
    };
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!confetti) return;
    const timer = window.setTimeout(() => setConfetti(false), 2600);
    return () => window.clearTimeout(timer);
  }, [confetti]);

  const moodLabel = catMode ? "Pickle Override" : softMode ? "Solace Mode" : stormMode ? "Storm Theatre" : "Quietly Fantastic";
  const prompt = missionPrompts[promptIndex];

  function generatePrompt() {
    setPromptIndex((current) => (current + 1) % missionPrompts.length);
  }

  function handleCommand(command: string) {
    if (command.includes("storm")) {
      setStormMode(true);
      setSoftMode(false);
      setMode("signals");
      setConfetti(true);
      return;
    }
    if (command.includes("pickle")) {
      setCatMode(true);
      setConfetti(true);
      return;
    }
    if (command.includes("solace")) {
      setSoftMode(true);
      setStormMode(false);
      setConfetti(true);
      return;
    }
    if (command.includes("launch")) {
      setMode("simulator");
      setConfetti(true);
      return;
    }
    if (command.includes("reset")) {
      setStormMode(false);
      setCatMode(false);
      setSoftMode(false);
      setMode("mission");
      return;
    }
    generatePrompt();
  }

  return (
    <main
      className={cn(
        "min-h-screen overflow-hidden bg-slate-950 text-white",
        softMode && "soft-mode",
        stormMode && "storm-mode",
        catMode && "cat-mode"
      )}
    >
      <FloatingConfetti active={confetti} />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,.18),transparent_28%),radial-gradient(circle_at_78%_18%,rgba(217,70,239,.16),transparent_26%),radial-gradient(circle_at_50%_90%,rgba(16,185,129,.12),transparent_35%)]" />
      <div className="noise pointer-events-none fixed inset-0 opacity-[0.08]" />

      <section className="relative mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
        <nav className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-200 via-violet-300 to-fuchsia-300 text-xl font-black text-slate-950 shadow-[0_0_35px_rgba(103,232,249,.22)]">
              PL
            </div>
            <div>
              <p className="text-sm font-black leading-none">ProximityLink</p>
              <p className="mt-1 text-xs text-slate-400">/surprise route · experimental</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
            <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-2">{time || "--:--:--"}</span>
            <span className="rounded-full border border-emerald-200/20 bg-emerald-200/10 px-3 py-2 text-emerald-100">{moodLabel}</span>
            {catMode && <span className="rounded-full border border-amber-200/30 bg-amber-200/10 px-3 py-2 text-amber-100">Pickle requests treats</span>}
          </div>
        </nav>

        <header className="grid items-center gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-200/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-cyan-100">
              <span className="h-2 w-2 rounded-full bg-cyan-200 shadow-[0_0_18px_rgba(103,232,249,.9)]" />
              Secret build detected
            </div>
            <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-tight text-white sm:text-7xl lg:text-8xl">
              The calm inside the operational storm.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              A hidden ProximityLink playground for smart dispatch, crew fairness, live signals and the sort of beautifully unnecessary flourish that makes a website feel alive.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setMode("simulator");
                  setConfetti(true);
                }}
                className="rounded-2xl bg-white px-6 py-4 text-sm font-black text-slate-950 shadow-xl transition hover:scale-[1.02] active:scale-[0.98]"
              >
                Open the sandbox
              </button>
              <button
                type="button"
                onClick={() => {
                  setStormMode((current) => !current);
                  setConfetti(true);
                }}
                className="rounded-2xl border border-white/10 bg-white/[0.06] px-6 py-4 text-sm font-black text-white transition hover:border-cyan-200/40 hover:bg-cyan-200/10"
              >
                Toggle storm theatre
              </button>
            </div>
          </div>
          <RadarOrb active={stormMode || softMode || catMode} />
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Routes scored" value="1,284" foot="Synthetic decisions, real product energy" pulse />
          <StatCard label="Avg calm gained" value="+17m" foot="Entirely made up, emotionally accurate" />
          <StatCard label="Fairness checks" value="98.7%" foot="Because the closest crew is not always the right crew" />
          <StatCard label="Secret page rating" value="10/10" foot="Certified unnecessary but excellent" />
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <CommandConsole onCommand={handleCommand} />
          <div className="glass-card rounded-3xl p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/70">Mini map</p>
            <h3 className="mt-2 text-xl font-black text-white">Network constellation</h3>
            <div className="relative mt-5 h-72 overflow-hidden rounded-3xl border border-white/10 bg-black/25">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
              {[{"x":18,"y":34,"label":"Basingstoke"},{"x":44,"y":55,"label":"Andover"},{"x":71,"y":28,"label":"Reading"},{"x":63,"y":72,"label":"Winchester"},{"x":83,"y":58,"label":"Portsmouth"}].map((pin, index) => (
                <div key={pin.label} className="absolute" style={{ left: `${pin.x}%`, top: `${pin.y}%` }}>
                  <span className="map-ping absolute -left-2 -top-2 h-4 w-4 rounded-full bg-cyan-200/40" style={{ animationDelay: `${index * 0.25}s` }} />
                  <span className="relative z-10 block h-3 w-3 rounded-full bg-cyan-100 shadow-[0_0_22px_rgba(103,232,249,.9)]" />
                  <span className="absolute left-4 top-0 whitespace-nowrap rounded-full border border-white/10 bg-black/50 px-2 py-1 text-[10px] font-bold text-slate-200 backdrop-blur">{pin.label}</span>
                </div>
              ))}
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M18 34 C35 25 45 50 44 55 S61 76 63 72 C66 58 72 39 71 28 M63 72 C75 70 77 58 83 58" fill="none" stroke="rgba(103,232,249,.35)" strokeWidth="0.45" strokeDasharray="2 2" />
              </svg>
            </div>
          </div>
        </section>

        <section id="simulator" className="mt-10">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-100/70">{modeCopy[mode].eyebrow}</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">{modeCopy[mode].title}</h2>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">{modeCopy[mode].text}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <ModeButton mode="mission" activeMode={mode} setMode={setMode}>Mission</ModeButton>
              <ModeButton mode="simulator" activeMode={mode} setMode={setMode}>Simulator</ModeButton>
              <ModeButton mode="signals" activeMode={mode} setMode={setMode}>Signals</ModeButton>
              <ModeButton mode="archive" activeMode={mode} setMode={setMode}>Archive</ModeButton>
            </div>
          </div>

          {mode === "mission" && <MissionPanel prompt={prompt} generatePrompt={generatePrompt} />}
          {mode === "simulator" && <SimulatorPanel incident={incident} setIncident={setIncident} urgency={urgency} setUrgency={setUrgency} />}
          {mode === "signals" && <SignalsPanel stormMode={stormMode} />}
          {mode === "archive" && <ArchivePanel />}
        </section>

        <section className="my-10 grid gap-5 lg:grid-cols-3">
          <div className="glass-card rounded-3xl p-6 lg:col-span-2">
            <p className="text-xs uppercase tracking-[0.24em] text-fuchsia-100/70">Surprise payload</p>
            <h2 className="mt-3 text-3xl font-black text-white">A page with no business case, which is sometimes the best kind.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              This route can be your hidden demo, your Easter egg, your accidental investor theatre, or just a place to remind yourself that the product can have personality without losing its usefulness.
            </p>
          </div>
          <div className="glass-card rounded-3xl p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/70">Final status</p>
            <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-center">
              <p className="text-5xl">{catMode ? "🐈" : stormMode ? "⚡" : softMode ? "🕯️" : "🚀"}</p>
              <p className="mt-3 text-2xl font-black text-white">{moodLabel}</p>
              <p className="mt-2 text-sm text-slate-300">Hidden page armed and ready.</p>
            </div>
          </div>
        </section>
      </section>

      <style jsx global>{`
        .glass-card {
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: linear-gradient(135deg, rgba(255,255,255,0.09), rgba(255,255,255,0.035));
          box-shadow: 0 24px 80px rgba(0,0,0,0.28);
          backdrop-filter: blur(18px);
        }

        .noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.38'/%3E%3C/svg%3E");
        }

        .radar-sweep::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: conic-gradient(from 90deg, rgba(103,232,249,0.35), rgba(103,232,249,0.03), transparent 40%);
          animation: spin 8s linear infinite;
          mask: radial-gradient(circle, transparent 0 19%, black 20% 100%);
        }

        .radar-sweep-fast::before {
          animation-duration: 2.8s;
        }

        .map-ping {
          animation: pingSoft 2.2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .confetti-piece {
          top: -20px;
          animation: confettiFall 2.6s ease-in forwards;
        }

        .soft-mode {
          background: #080816;
        }

        .storm-mode {
          background: #0f0711;
        }

        .cat-mode .glass-card {
          border-color: rgba(253, 230, 138, 0.22);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes pingSoft {
          75%, 100% {
            transform: scale(3.4);
            opacity: 0;
          }
        }

        @keyframes confettiFall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(680deg);
            opacity: 0;
          }
        }
      `}</style>
    </main>
  );
}
