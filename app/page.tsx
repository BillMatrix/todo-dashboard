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

export default function Home() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<TaskWithSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithSubject | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [newTaskSubject, setNewTaskSubject] = useState<string | null>(null);

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

  const handleAddTask = async (task: { title: string; description: string; deadline: string | null; status: TaskWithSubject["status"]; subject_id: string }) => {
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
    return map;
  };

  const subjectTasks = (selectedSubject ? tasks.filter((t) => t.subject_id === selectedSubject) : tasks);
  const totalCounts = { not_started: 0, in_progress: 0, done: 0 };
  subjectTasks.forEach((t) => totalCounts[t.status]++);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col overflow-y-auto flex-shrink-0">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-base font-bold text-gray-900">Todo Dashboard</h1>
        </div>

        <button
          onClick={() => setSelectedSubject(null)}
          className={`mx-2 px-3 py-2.5 text-left text-sm font-medium rounded-lg transition-colors ${
            !selectedSubject ? "bg-blue-50 text-blue-700 border-l-2 border-blue-600" : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <div className="font-semibold">All Subjects</div>
          <div className="text-xs text-gray-400 mt-0.5">{subjectTasks.length} tasks</div>
        </button>

        {subjects.map((subject) => {
          const count = tasks.filter((t) => t.subject_id === subject.id).length;
          return (
            <button
              key={subject.id}
              onClick={() => setSelectedSubject(subject.id)}
              className={`mx-2 mt-0.5 px-3 py-2.5 text-left text-sm rounded-lg truncate transition-colors ${
                selectedSubject === subject.id
                  ? "bg-blue-50 text-blue-700 border-l-2 border-blue-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div className="font-medium truncate">{subject.name}</div>
              <div className="text-xs text-gray-400">{count} tasks</div>
            </button>
          );
        })}

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
