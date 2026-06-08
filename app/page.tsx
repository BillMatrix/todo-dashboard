"use client";

import { useEffect, useState } from "react";
import { supabase, Subject, TaskWithSubject } from "./lib/supabase";
import TaskCard from "./components/TaskCard";
import TaskModal from "./components/TaskModal";
import SubjectModal from "./components/SubjectModal";

type Tab = "not_started" | "in_progress" | "done";

const COLUMNS: { key: Tab; label: string; color: string; borderColor: string; bg: string }[] = [
  { key: "not_started", label: "Not Started", color: "text-red-600", borderColor: "border-red-400", bg: "bg-red-50" },
  { key: "in_progress", label: "In Progress", color: "text-yellow-600", borderColor: "border-yellow-400", bg: "bg-yellow-50" },
  { key: "done", label: "Done", color: "text-green-600", borderColor: "border-green-400", bg: "bg-green-50" },
];

// Load prioritized subjects from localStorage
const loadPrioritized = (): string[] => {
  try { return JSON.parse(localStorage.getItem("prioritized_subjects") || "[]"); }
  catch { return []; }
};
const savePrioritized = (ids: string[]) => localStorage.setItem("prioritized_subjects", JSON.stringify(ids));

export default function Home() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<TaskWithSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithSubject | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [newTaskSubject, setNewTaskSubject] = useState<string | null>(null);
  const [prioritized, setPrioritized] = useState<string[]>(loadPrioritized);

  const fetchData = async () => {
    setLoading(true);
    const [subjectsRes, tasksRes] = await Promise.all([
      supabase.from("subjects").select("*").order("name"),
      supabase.from("tasks").select("*, subject:subjects!subject_id(name)").order("deadline", { ascending: true }),
    ]);

    if (subjectsRes.error) console.error("Subjects error:", subjectsRes.error);
    else setSubjects(subjectsRes.data || []);

    if (tasksRes.error) console.error("Tasks error:", tasksRes.error);
    else setTasks(tasksRes.data || []);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTask = async (task: { title: string; description: string | null; deadline: string | null; status: TaskWithSubject["status"]; subject_id: string }) => {
    if (editingTask) {
      const { error } = await supabase.from("tasks").update({ ...task }).eq("id", editingTask.id);
      if (error) { console.error(error); return; }
    } else {
      const { error } = await supabase.from("tasks").insert([task]);
      if (error) { console.error(error); return; }
    }
    setTaskModalOpen(false);
    setEditingTask(null);
    fetchData();
  };

  const handleDeleteTask = async (id: string) => {
    await supabase.from("tasks").delete().eq("id", id);
    fetchData();
  };

  const handleCycleStatus = async (task: TaskWithSubject) => {
    const order: TaskWithSubject["status"][] = ["not_started", "in_progress", "done"];
    const next = order[(order.indexOf(task.status) + 1) % 3];
    await supabase.from("tasks").update({ status: next }).eq("id", task.id);
    fetchData();
  };

  const handleAddSubject = async (name: string) => {
    const { error } = await supabase.from("subjects").insert([{ name }]);
    if (error) { console.error(error); return; }
    setSubjectModalOpen(false);
    fetchData();
  };

  const handleDeleteSubject = async (id: string) => {
    // Delete all tasks for this subject first (cascade)
    await supabase.from("tasks").delete().eq("subject_id", id);
    await supabase.from("subjects").delete().eq("id", id);
    // Update prioritized list
    const updated = prioritized.filter((pid) => pid !== id);
    setPrioritized(updated);
    savePrioritized(updated);
    if (selectedSubject === id) setSelectedSubject(null);
    fetchData();
  };

  const handleTogglePriority = (id: string) => {
    const updated = prioritized.includes(id)
      ? prioritized.filter((pid) => pid !== id)
      : [...prioritized, id];
    setPrioritized(updated);
    savePrioritized(updated);
  };

  const openAddTask = (subjectId?: string) => {
    setEditingTask(null);
    setNewTaskSubject(subjectId || null);
    setTaskModalOpen(true);
  };

  const openEditTask = (task: TaskWithSubject) => {
    setEditingTask(task);
    setNewTaskSubject(null);
    setTaskModalOpen(true);
  };

  const filteredTasks = selectedSubject
    ? tasks.filter((t) => t.subject_id === selectedSubject)
    : tasks;

  const groupedBySubject = (status: Tab): Map<string, TaskWithSubject[]> => {
    const map = new Map<string, TaskWithSubject[]>();
    for (const task of filteredTasks.filter((t) => t.status === status)) {
      const subject = subjects.find((s) => s.id === task.subject_id);
      const key = subject?.name || "Unknown";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(task);
    }
    // Sort tasks within each group by deadline (ascending), no-deadline tasks last
    map.forEach((taskList) => {
      taskList.sort((a: TaskWithSubject, b: TaskWithSubject) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return a.deadline.localeCompare(b.deadline);
      });
    });
    // When viewing all subjects, sort groups by priority then name
    if (!selectedSubject) {
      const sorted = Array.from(map.entries()).sort(([aName], [bName]) => {
        const aSubject = subjects.find((s) => s.name === aName);
        const bSubject = subjects.find((s) => s.name === bName);
        const aP = aSubject && prioritized.includes(aSubject.id) ? 0 : 1;
        const bP = bSubject && prioritized.includes(bSubject.id) ? 0 : 1;
        if (aP !== bP) return aP - bP;
        return aName.localeCompare(bName);
      });
      const sortedMap = new Map(sorted);
      return sortedMap;
    }
    return map;
  };

  const subjectTasks = (selectedSubject ? tasks.filter((t) => t.subject_id === selectedSubject) : tasks);
  const totalCounts = { not_started: 0, in_progress: 0, done: 0 };
  subjectTasks.forEach((t) => totalCounts[t.status]++);

  // Sort subjects: prioritized first, then by not-started task count (desc), then alphabetical
  const notStartedCounts: Record<string, number> = {};
  tasks.filter((t) => t.status === "not_started").forEach((t) => {
    notStartedCounts[t.subject_id] = (notStartedCounts[t.subject_id] || 0) + 1;
  });

  const sortedSubjects = [...subjects].sort((a, b) => {
    const aP = prioritized.includes(a.id) ? 0 : 1;
    const bP = prioritized.includes(b.id) ? 0 : 1;
    if (aP !== bP) return aP - bP;
    const aCount = notStartedCounts[a.id] || 0;
    const bCount = notStartedCounts[b.id] || 0;
    if (bCount !== aCount) return bCount - aCount;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-y-auto flex-shrink-0">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-base font-bold text-gray-900">Todo Dashboard</h1>
        </div>

        <div className="px-2 pt-2">
          <button
            onClick={() => setSelectedSubject(null)}
            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
              !selectedSubject ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div className="font-semibold">All Subjects</div>
            <div className="text-xs text-gray-400">{subjectTasks.filter((t) => t.status !== "done").length} tasks</div>
          </button>
        </div>

        <div className="px-2 py-1 space-y-0.5">
          {sortedSubjects.map((subject) => {
            const count = tasks.filter((t) => t.subject_id === subject.id && t.status !== "done").length;
            const isPrioritized = prioritized.includes(subject.id);
            return (
              <div
                key={subject.id}
                className={`group rounded-lg transition-colors ${
                  selectedSubject === subject.id ? "bg-blue-50" : "hover:bg-gray-50"
                }`}
              >
                <button
                  onClick={() => setSelectedSubject(subject.id)}
                  className="w-full text-left px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-1.5">
                    {isPrioritized && (
                      <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26 6.91 1.01-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
                      </svg>
                    )}
                    <span className="font-medium truncate">{subject.name}</span>
                  </div>
                  <div className="text-xs text-gray-400">{count} tasks</div>
                </button>
                <div className="flex justify-end px-2 pb-1 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleTogglePriority(subject.id); }}
                    className="p-1 text-gray-400 hover:text-amber-500 rounded transition-colors"
                    title={isPrioritized ? "Remove priority" : "Mark as priority"}
                  >
                    <svg className="w-3.5 h-3.5" fill={isPrioritized ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.26.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.55-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.518-4.674z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteSubject(subject.id); }}
                    className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                    title="Delete subject"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 mt-2">
          <button
            onClick={() => setSubjectModalOpen(true)}
            className="w-full px-3 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            + Add Subject
          </button>
        </div>
      </aside>

      {/* Main Kanban Board */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="px-6 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {selectedSubject
              ? subjects.find((s) => s.id === selectedSubject)?.name
              : "All Subjects"}
          </h2>
          <button
            onClick={() => openAddTask(selectedSubject || (subjects[0]?.id || ""))}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Add Task
          </button>
        </header>

        <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 py-4">
          <div className="flex gap-4 h-full min-w-[900px]">
            {COLUMNS.map(({ key: status, label, color, borderColor, bg }) => {
              const columnTasks = groupedBySubject(status);
              const count = totalCounts[status];

              return (
                <div key={status} className="flex-1 min-w-0 flex flex-col">
                  <div className={`flex items-center gap-2 mb-3 pb-2 border-b-2 ${borderColor}`}>
                    <span className={`text-sm font-bold ${color}`}>{label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${bg} ${color}`}>{count}</span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                    {columnTasks.size === 0 ? (
                      <div className="text-center py-8 text-sm text-gray-400">No tasks</div>
                    ) : (
                      Array.from(columnTasks.entries()).map(([subjectName, subjectTasks]) => (
                        <div key={subjectName}>
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
                            {subjectName}
                          </div>
                          <div className="space-y-2">
                            {subjectTasks.map((task) => (
                              <TaskCard
                                key={task.id}
                                task={task}
                                onCycleStatus={handleCycleStatus}
                                onEdit={openEditTask}
                                onDelete={handleDeleteTask}
                              />
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <TaskModal
        open={taskModalOpen}
        onClose={() => { setTaskModalOpen(false); setEditingTask(null); }}
        onSubmit={handleAddTask}
        subjects={subjects}
        selectedSubject={newTaskSubject || selectedSubject}
        initialData={editingTask || undefined}
      />

      <SubjectModal
        open={subjectModalOpen}
        onClose={() => setSubjectModalOpen(false)}
        onSubmit={handleAddSubject}
      />
    </div>
  );
}
