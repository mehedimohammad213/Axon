import React from "react";
import { Button, Card, Popconfirm, Tooltip } from "antd";
import {
  CaretDownOutlined,
  CaretRightOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteFilled,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  FormOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { getResponseDisplayName } from "./getResponseDisplayName";
import { resolveMediaUrl } from "../../utils/mediaUrl";

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

const formatFieldLabel = (key) =>
  String(key || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatFieldValue = (key, value) => {
  if (value === null || value === undefined || value === "") return "—";
  if (key === "callTime" && Array.isArray(value) && value.length === 2) {
    return `${moment(value[0], "HH:mm").format("hh:mm A")} - ${moment(
      value[1],
      "HH:mm"
    ).format("hh:mm A")}`;
  }
  if (Array.isArray(value)) return value.filter(Boolean).join(", ") || "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const getCurrentStatus = (response) =>
  String(response?.status || "pending").toLowerCase();

const getCvUrl = (mediaList) => {
  if (!mediaList?.cv?.file_path) return null;
  return resolveMediaUrl(mediaList.cv.file_path);
};

const FormResponseRow = ({
  response,
  expandedResponseId,
  handleExpand,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const isExpanded = expandedResponseId === response.id;
  const displayName = getResponseDisplayName(response.form_data) || "Untitled response";
  const email = response.form_data?.email || "";
  const status = getCurrentStatus(response);
  const isPending = status === "pending";
  const submittedAt = response.created_at
    ? moment(response.created_at).format("MMM D, YYYY h:mm A")
    : "—";
  const formDataEntries = Object.entries(response.form_data || {}).filter(
    ([, value]) => value !== null && value !== undefined && value !== ""
  );
  const cvUrl = getCvUrl(response.media_list);

  const toggleCard = () => {
    handleExpand(response.id);
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
            handleExpand(response.id);
          }}
        >
          {isExpanded ? <CaretDownOutlined /> : <CaretRightOutlined />}
        </button>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-brand-light text-brand-dark">
          <FormOutlined className="text-lg" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
              #{response.id}
            </span>
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                isPending
                  ? "bg-amber-50 text-amber-700"
                  : "bg-green-50 text-green-700"
              }`}
            >
              {isPending ? "Pending" : "Resolved"}
            </span>
            {response.form_type && (
              <span className="rounded-md bg-brand-light px-2 py-0.5 text-xs font-medium capitalize text-brand-dark">
                {response.form_type}
              </span>
            )}
          </div>

          <h3
            className="mt-1.5 min-h-7 truncate text-base font-semibold leading-7 text-gray-900 sm:text-lg"
            title={displayName}
          >
            {displayName}
          </h3>

          <Tooltip title={email || submittedAt} placement="topLeft">
            <p className="mt-0.5 min-h-5 truncate text-sm leading-5 text-gray-500">
              {email || submittedAt || "\u00A0"}
            </p>
          </Tooltip>
        </div>

        <div
          className="flex shrink-0 flex-wrap items-center justify-end gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            icon={<EyeOutlined />}
            onClick={() => onView?.(response)}
            className="headlessbutton headlessbutton-pill !mr-0"
          >
            View
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={() => onEdit?.(response)}
            className="headlessbutton headlessbutton-pill !mr-0"
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this response?"
            description="This cannot be undone."
            onConfirm={() => onDelete?.(response.id)}
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
          <div className="space-y-5 pt-4">
            <dl className="grid gap-4 sm:grid-cols-2">
              <InfoRow label="Name">{displayName}</InfoRow>
              <InfoRow label="Email">{email || "—"}</InfoRow>
              <InfoRow label="Form type">
                {response.form_type || "—"}
              </InfoRow>
              <InfoRow label="Status">{isPending ? "Pending" : "Resolved"}</InfoRow>
              <InfoRow label="Submitted">{submittedAt}</InfoRow>
              {formDataEntries
                .filter(([key]) => !["name", "email", "full_name", "fullName"].includes(key))
                .map(([key, value]) => (
                  <InfoRow key={key} label={formatFieldLabel(key)}>
                    {formatFieldValue(key, value)}
                  </InfoRow>
                ))}
            </dl>

            <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
              <Button
                icon={<CheckCircleOutlined />}
                onClick={() => onToggleStatus?.(response)}
                className="headlessbutton headlessbutton-pill !mr-0"
              >
                Mark as {isPending ? "Resolved" : "Pending"}
              </Button>
              {cvUrl && (
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() => window.open(cvUrl, "_blank")}
                  className="headlessbutton headlessbutton-pill !mr-0"
                >
                  Download CV
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default FormResponseRow;
