// components/PageBuilder/Components/FloatingActionButtons.jsx

import React from "react";
import { Button } from "antd";
import { SaveOutlined, EyeOutlined } from "@ant-design/icons";

const FloatingActionButtons = ({
  isEditing,
  isDirty,
  loading,
  lastSaved,
  onSave,
  onPreview,
}) => {
  if (!isEditing) return null;

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2 sm:bottom-28 sm:right-6 lg:right-8">
      <div className="min-w-[11.5rem] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-600 shadow-lg">
        <div className="flex items-center gap-2 font-medium">
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${
              isDirty ? "bg-warning" : "bg-success"
            }`}
          />
          <span>{isDirty ? "Unsaved changes" : "All changes saved"}</span>
        </div>
        {lastSaved && (
          <div className="mt-1 text-slate-400">
            Last saved: {new Date(lastSaved).toLocaleTimeString()}
          </div>
        )}
        <div className="mt-1 text-slate-400">Ctrl/⌘+S to save</div>
      </div>

      <Button
        type="primary"
        icon={<SaveOutlined />}
        size="large"
        onClick={onSave}
        loading={loading}
        className={`!mr-0 inline-flex h-11 min-w-[11.5rem] items-center justify-center gap-2 rounded-xl border-0 px-4 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl ${
          isDirty
            ? "bg-brand hover:bg-brand-dark"
            : "bg-success hover:bg-success-dark"
        }`}
      >
        {isDirty ? "Save Page" : "Saved"}
      </Button>

      {/* <Button
        type="primary"
        icon={<EyeOutlined />}
        size="large"
        onClick={onPreview}
        className="!mr-0 inline-flex h-11 min-w-[11.5rem] items-center justify-center gap-2 rounded-xl border-0 bg-slate-600 px-4 text-sm font-semibold text-white shadow-lg transition-all hover:bg-slate-700 hover:shadow-xl"
      >
        Preview Page
      </Button> */}
    </div>
  );
};

export default FloatingActionButtons;
