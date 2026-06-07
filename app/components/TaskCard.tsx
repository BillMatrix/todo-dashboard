"use client";

import { TaskWithSubject } from "../lib/supabase";
import { format, isBefore, parseISO } from "date-fns";

type Props = {
  task: TaskWithSubject;
  onCycleStatus: (task: TaskWithSubject) => void;
  onEdit: (task: TaskWithSubject) => void;
  onDelete: (id: string) => void;
};

const statusConfig = {
  not_started: { label: "Not Started", dot: "bg-red-500" },
  in_progress: { label: "In Progress", dot: "bg-yellow-500" },
  done: { label: "Done", dot: "bg-green-500" },
};

export default function TaskCard({ task, onCycleStatus, onEdit, onDelete }: Props) {
  const status = statusConfig[task.status];
  const isOverdue = task.deadline && isBefore(parseISO(task.deadline), new Date()) && task.status !== "done";

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow ${isOverdue ? "border-red-300" : ""}`}>
      <div className="flex items-start gap-2">
        <button
          onClick={() => onCycleStatus(task)}
          className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
            task.status === "done" ? "border-green-500 bg-green-500" : "border-gray-300 hover:border-blue-500"
          }`}
          title={`Click to move to ${status.label === "Not Started" ? "In Progress" : status.label === "In Progress" ? "Done" : "Not Started"}`}
        >
          {task.status === "done" && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 9" /></svg>}
          {task.status !== "done" && <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />}
        </button>

        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-medium leading-snug ${task.status === "done" ? "line-through text-gray-400" : "text-gray-900"}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
          )}
          {task.deadline && (
            <div className="flex items-center gap-1 mt-1.5">
              <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span className={`text-xs ${isOverdue ? "text-red-500 font-medium" : "text-gray-400"}`}>
                {format(parseISO(task.deadline), "MMM d, yyyy")}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-0.5 flex-shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="p-1 text-gray-300 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
            title="Edit"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 13H9v-2.828l8.586-8.586z" /></svg>
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 text-gray-300 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
