import React from "react";
import { Button, Card, Popconfirm, Tooltip, Badge } from "antd";
import {
  CloseCircleOutlined,
  DeleteFilled,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/router";

const idBadgeStyle = {
  backgroundColor: "#f0f0f0",
  color: "#666",
  fontSize: "12px",
  fontWeight: "500",
};

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

const FormRow = ({ form, onPreview, onDelete }) => {
  const router = useRouter();
  const description = stripHtml(form.description);
  const elements = getFormElements(form);
  const fieldCount = elements.filter(
    (element) => element?.element_type !== "button" && element?.type !== "button"
  ).length;

  const actions = [
    <Button
      key="preview"
      icon={<EyeOutlined />}
      onClick={() => onPreview(form.id)}
      className="headlessbutton headlessbutton-pill !mr-0"
    >
      Preview
    </Button>,
    <Button
      key="edit"
      icon={<EditOutlined />}
      onClick={() => router.push(`/formbuilder/edit-form?id=${form.id}`)}
      className="headlessbutton headlessbutton-pill !mr-0"
    >
      Edit
    </Button>,
    <Popconfirm
      key="delete"
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
        className="headlesscancelbutton headlessbutton-pill !mr-0"
        icon={<DeleteOutlined />}
      >
        Delete
      </Button>
    </Popconfirm>,
  ];

  return (
    <Card
      hoverable
      actions={actions}
      className="media-card slider-card page-list-card overflow-hidden shadow-md rounded-md"
    >
      <div className="flex flex-col pt-3">
        <div className="media-card-meta flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Badge count={`ID-${form.id}`} style={idBadgeStyle} />
            <h3
              className="m-0 truncate text-base font-semibold"
              title={form.title || "Untitled form"}
            >
              {form.title || "Untitled form"}
            </h3>
          </div>
          <h5 className="mb-0 shrink-0 text-sm font-bold text-gray-400">
            Form
          </h5>
        </div>

        <Tooltip title={description || undefined} placement="topLeft">
          <p className="mt-2 truncate text-sm leading-5 text-gray-500">
            {description || "No description"}
          </p>
        </Tooltip>

        <div className="mt-3 space-y-2 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Fields
            </span>
            <span className="text-sm font-medium text-gray-800">
              {fieldCount} field{fieldCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FormRow;
