import React from "react";
import { Button, Card, Popconfirm, Tooltip } from "antd";
import {
  CaretDownOutlined,
  CaretRightOutlined,
  CloseCircleOutlined,
  DeleteFilled,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/router";

const InfoRow = ({ label, children }) => (
  <div className="min-w-0">
    <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
      {label}
    </dt>
    <dd className="mt-1 break-words text-sm font-medium text-gray-800">
      {children}
    </dd>
  </div>
);

const stripHtml = (html) => {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
};

const getFormElements = (form) => {
  if (Array.isArray(form?.elements)) return form.elements;
  if (typeof form?.elements === "string") {
    try {
      const parsed = JSON.parse(form.elements);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const FormRow = ({ form, expandedFormId, handleExpand, onPreview, onDelete }) => {
  const router = useRouter();
  const isExpanded = expandedFormId === form.id;
  const description = stripHtml(form.description);
  const elements = getFormElements(form);
  const fieldCount = elements.filter(
    (element) => element?.element_type !== "button" && element?.type !== "button"
  ).length;

  const toggleCard = () => {
    handleExpand(form.id);
  };

  return (
    <Card
      className={`w-full cursor-pointer overflow-hidden rounded-xl border transition-shadow duration-200 ${
        isExpanded
          ? "border-brand/40 shadow-md"
          : "border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md"
      }`}
      bodyStyle={{ padding: 0 }}
      onClick={toggleCard}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggleCard();
        }
      }}
    >
      <div className="flex min-h-[88px] items-center gap-3 px-5 py-4">
        <button
          type="button"
          aria-label={isExpanded ? "Collapse" : "Expand"}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${
            isExpanded
              ? "border-brand/30 bg-brand-light text-brand-dark"
              : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            handleExpand(form.id);
          }}
        >
          {isExpanded ? <CaretDownOutlined /> : <CaretRightOutlined />}
        </button>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-brand-light text-brand-dark">
          <FileTextOutlined className="text-lg" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
              #{form.id}
            </span>
            <span className="rounded-md bg-brand-light px-2 py-0.5 text-xs font-medium text-brand-dark">
              {fieldCount} field{fieldCount !== 1 ? "s" : ""}
            </span>
          </div>

          <h3
            className="mt-1.5 min-h-7 truncate text-base font-semibold leading-7 text-gray-900 sm:text-lg"
            title={form.title || "Untitled form"}
          >
            {form.title || "Untitled form"}
          </h3>

          <Tooltip title={description || undefined} placement="topLeft">
            <p className="mt-0.5 min-h-5 truncate text-sm leading-5 text-gray-500">
              {description || "\u00A0"}
            </p>
          </Tooltip>
        </div>

        <div
          className="flex shrink-0 flex-wrap items-center justify-end gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            icon={<EyeOutlined />}
            onClick={() => onPreview(form.id)}
            className="headlessbutton headlessbutton-pill !mr-0"
          >
            Preview
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={() => router.push(`/formbuilder/edit-form?id=${form.id}`)}
            className="headlessbutton headlessbutton-pill !mr-0"
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this form?"
            description="This cannot be undone."
            onConfirm={() => onDelete(form.id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{
              danger: true,
              icon: <DeleteFilled />,
            }}
            cancelButtonProps={{
              icon: <CloseCircleOutlined />,
            }}
          >
            <Button
              icon={<DeleteFilled />}
              className="headlesscancelbutton headlessbutton-pill !mr-0"
            >
              Delete
            </Button>
          </Popconfirm>
        </div>
      </div>

      {isExpanded && (
        <div
          className="border-t border-gray-100 px-5 pb-5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="pt-4">
            <dl className="grid gap-4 sm:grid-cols-2">
              <InfoRow label="Form title">{form.title || "—"}</InfoRow>
              <InfoRow label="Fields">{fieldCount}</InfoRow>
              <InfoRow label="Description">{description || "—"}</InfoRow>
            </dl>
          </div>
        </div>
      )}
    </Card>
  );
};

export default FormRow;
