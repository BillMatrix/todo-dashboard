"use client";

type Tab = "not_started" | "in_progress" | "done";

type Props = {
  active: Tab;
  onChange: (tab: Tab) => void;
  counts: Record<Tab, number>;
};

const tabs: { key: Tab; label: string; color: string; activeColor: string }[] = [
  { key: "not_started", label: "Not Started", color: "text-gray-500", activeColor: "text-red-600" },
  { key: "in_progress", label: "In Progress", color: "text-gray-500", activeColor: "text-yellow-600" },
  { key: "done", label: "Done", color: "text-gray-500", activeColor: "text-green-600" },
];

export default function StatusTabs({ active, onChange, counts }: Props) {
  return (
    <div className="flex border-b border-gray-200 bg-white">
      {tabs.map(({ key, label, activeColor }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            active === key
              ? `border-current ${activeColor}`
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          {label}
          <span className={`ml-2 text-xs ${active === key ? activeColor : "text-gray-400"}`}>
            {counts[key]}
          </span>
        </button>
      ))}
    </div>
  );
}
