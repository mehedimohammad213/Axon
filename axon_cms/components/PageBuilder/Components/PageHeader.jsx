// components/PageBuilder/Components/PageHeader.jsx

import React from "react";
import { Button } from "antd";
import {
  ArrowLeftOutlined,
  EyeOutlined,
  EditOutlined,
  UndoOutlined,
  RedoOutlined,
  SaveOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/router";
import { getPageListPath } from "../utils/getPageListPath";

const PageHeader = ({
  pageData,
  isEditing,
  isDirty,
  canUndo,
  canRedo,
  onToggleEdit,
  onUndo,
  onRedo,
  onSave,
  loading = false,
}) => {
  const router = useRouter();
  const pageName = pageData?.page_name_en || "Untitled Page";

  const handleBack = () => {
    router.push(getPageListPath(pageData));
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 pt-4 sm:px-6 lg:px-8">
      <header className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="mt-0.5 shrink-0 rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
              aria-label="Back to pages"
              title="Back to pages"
            >
              <ArrowLeftOutlined className="text-base" />
            </button>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="truncate text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                  {pageName}
                </h1>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    isEditing
                      ? "bg-brand-light text-brand-dark"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {isEditing ? "Editing" : "Preview"}
                </span>
                {isDirty && isEditing ? (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600">
                    <ExclamationCircleOutlined />
                    Unsaved changes
                  </span>
                ) : (
                  isEditing && (
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                      <CheckCircleOutlined />
                      Saved
                    </span>
                  )
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {isEditing
                  ? "Edit sections and components · Ctrl/⌘+S to save"
                  : "Read-only view · switch to Edit to make changes"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pl-11 lg:pl-0">
            {isEditing ? (
              <>
                <Button
                  icon={<UndoOutlined />}
                  onClick={onUndo}
                  disabled={!canUndo}
                  className="!mr-0"
                >
                  Undo
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={onSave}
                  loading={loading}
                  className={`headlessbutton !mr-0 ${
                    isDirty
                      ? ""
                      : "!border-emerald-600 !bg-emerald-500 hover:!bg-emerald-600"
                  }`}
                >
                  {isDirty ? "Save Page" : "Saved"}
                </Button>
                {/* <Button
                  icon={<RedoOutlined />}
                  onClick={onRedo}
                  disabled={!canRedo}
                  className="headlesscancelbutton !mr-0"
                >
                  Redo
                </Button> */}
                {/* <Button
                  icon={<EyeOutlined />}
                  onClick={onToggleEdit}
                  className="headlessbutton !mr-0"
                >
                  Preview
                </Button> */}
              </>
            ) : (
              <Button
                icon={<EditOutlined />}
                onClick={onToggleEdit}
                className="headlessbutton !mr-0"
              >
                Edit Page
              </Button>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};

export default PageHeader;
