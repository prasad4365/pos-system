"use client";

interface StatCardProps {
  title: string;
  value: string | number;
  sub?: string;
  icon: string;
  accent?: "default" | "green" | "blue" | "orange" | "red";
}

const accentMap: Record<string, { card: string; icon: string }> = {
  default: {
    card: "bg-white border-slate-200",
    icon: "from-slate-400 to-slate-500",
  },
  green: {
    card: "bg-white border-emerald-200",
    icon: "from-emerald-400 to-teal-500",
  },
  blue: {
    card: "bg-white border-indigo-200",
    icon: "from-indigo-400 to-violet-500",
  },
  orange: {
    card: "bg-white border-amber-200",
    icon: "from-amber-400 to-orange-500",
  },
  red: {
    card: "bg-white border-rose-200",
    icon: "from-rose-400 to-red-500",
  },
};

export default function StatCard({
  title,
  value,
  sub,
  icon,
  accent = "default",
}: StatCardProps) {
  const { card, icon: iconGrad } = accentMap[accent];
  return (
    <div className={`rounded-2xl border p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow ${card}`}>
      <div className="flex items-start justify-between">
        <span
          className="text-xs font-semibold text-muted-foreground uppercase tracking-wider leading-tight"
          style={{ fontFamily: "var(--font-jakarta)" }}
        >
          {title}
        </span>
        <div
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${iconGrad} flex items-center justify-center text-xl shadow-sm shrink-0 ml-2`}
        >
          {icon}
        </div>
      </div>
      <div
        className="text-3xl font-extrabold tracking-tight text-slate-800"
        style={{ fontFamily: "var(--font-jakarta)" }}
      >
        {value}
      </div>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
