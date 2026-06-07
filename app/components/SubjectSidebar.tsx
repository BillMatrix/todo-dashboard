"use client";

import { Subject } from "../lib/supabase";

type Tab = "not_started" | "in_progress" | "done";

type Props = {
  subjects: Subject[];
  counts: Record<string, Record<Tab, number>>;
  selectedSubject: string | null;
  onSelect: (id: string | null) => void;
  onAddSubject: () => void;
};

export default function SubjectSidebar({ subjects, counts, selectedSubject, onSelect, onAddSubject }: Props) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Subjects</h2>
      </div>

      <button
        onClick={() => onSelect(null)}
        className={`px-4 py-3 text-left text-sm font-medium border-l-4 ${
          !selectedSubject ? "border-blue-600 bg-blue-50 text-blue-700" : "border-transparent text-gray-700 hover:bg-gray-50"
        }`}
      >
        All
        <span className="float-right text-xs text-gray-400">
          {subjects.length}
        </span>
      </button>

      {subjects.map((subject) => {
        const c = counts[subject.id];
        const total = c ? c.not_started + c.in_progress + c.done : 0;
        return (
          <button
            key={subject.id}
            onClick={() => onSelect(subject.id)}
            className={`px-4 py-3 text-left text-sm border-l-4 truncate ${
              selectedSubject === subject.id
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-transparent text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span className="block truncate font-medium">{subject.name}</span>
            <span className="text-xs text-gray-400">{total} tasks</span>
          </button>
        );
      })}

      <div className="p-4 mt-auto">
        <button
          onClick={onAddSubject}
          className="w-full px-3 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
          + Add Subject
        </button>
      </div>
    </aside>
  );
}
