"use client";

import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
};

export default function SubjectModal({ open, onClose, onSubmit }: Props) {
  const [name, setName] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">New Subject</h2>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Subject name"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter" && name.trim()) {
              onSubmit(name.trim());
              setName("");
            }
          }}
        />

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { if (name.trim()) { onSubmit(name.trim()); setName(""); } }}
            disabled={!name.trim()}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
