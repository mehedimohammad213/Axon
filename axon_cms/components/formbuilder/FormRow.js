import React from "react";
import { Button, Card, Popconfirm, Tooltip } from "antd";
import {
  CaretDownOutlined,
  CaretRightOutlined,
  DeleteFilled,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/router";

const stripHtml = (html) => {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
};

const FormRow = ({
  form,
  expandedFormId,
  handleExpand,
  onPreview,
  onDelete,
}) => {
  const router = useRouter();
  const isExpanded = expandedFormId === form.id;
  const description = stripHtml(form.description);

  return (
    <Card
      className={`w-full overflow-hidden rounded-xl border transition-shadow duration-200 ${
        isExpanded
          ? "border-brand/40 shadow-md"
          : "border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md"
      }`}
      bodyStyle={{ padding: 0 }}
    >
      <div
        className="flex cursor-pointer items-start gap-3 px-5 py-4 sm:items-center"
        onClick={() => handleExpand(form.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleExpand(form.id);
          }
        }}
      >
        <button
          type="button"
          aria-label={isExpanded ? "Collapse" : "Expand"}
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${
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
          </div>

          <h3 className="mt-1.5 truncate text-base font-semibold text-gray-900 sm:text-lg">
            {form.title || "Untitled form"}
          </h3>

          {description && (
            <p className="mt-1 line-clamp-2 text-sm text-gray-500">
              {description}
            </p>
          )}
        </div>

        {!isExpanded && (
          <div
            className="flex shrink-0 items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <Tooltip title="Edit form">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() =>
                  router.push(`/formbuilder/edit-form?id=${form.id}`)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-brand-light hover:text-brand-dark"
              />
            </Tooltip>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-5">
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="min-w-0">
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Form title
                  </dt>
                  <dd className="mt-1 break-words text-sm font-medium text-gray-800">
                    {form.title || "—"}
                  </dd>
                </div>
                <div className="min-w-0 sm:col-span-2">
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Description
                  </dt>
                  <dd
                    className="mt-1 break-words text-sm text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html: form.description || "No description provided",
                    }}
                  />
                </div>
              </dl>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                icon={<EyeOutlined />}
                onClick={() => onPreview(form.id)}
                className="!mr-0 h-9 rounded-lg border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:border-brand hover:text-brand-dark"
              >
                Preview
              </Button>
              <Button
                icon={<EditOutlined />}
                onClick={() =>
                  router.push(`/formbuilder/edit-form?id=${form.id}`)
                }
                className="!mr-0 h-9 rounded-lg border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:border-brand hover:text-brand-dark"
              >
                Edit
              </Button>
              <Popconfirm
                title="Delete this form?"
                description="This cannot be undone."
                onConfirm={() => onDelete(form.id)}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Button
                  icon={<DeleteFilled />}
                  danger
                  className="!mr-0 ml-auto h-9 rounded-lg px-4 text-sm font-medium"
                >
                  Delete
                </Button>
              </Popconfirm>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default FormRow;
