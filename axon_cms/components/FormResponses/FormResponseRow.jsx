import React from "react";
import { Button, Card, Popconfirm, Tooltip, Badge, Tag } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteFilled,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { getResponseDisplayName } from "./getResponseDisplayName";
import { resolveMediaUrl } from "../../utils/mediaUrl";

const idBadgeStyle = {
  backgroundColor: "#f0f0f0",
  color: "#666",
  fontSize: "12px",
  fontWeight: "500",
};

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
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const displayName =
    getResponseDisplayName(response.form_data) || "Untitled response";
  const email = response.form_data?.email || "";
  const status = getCurrentStatus(response);
  const isPending = status === "pending";
  const submittedAt = response.created_at
    ? moment(response.created_at).format("MMM D, YYYY h:mm A")
    : "—";
  const formDataEntries = Object.entries(response.form_data || {}).filter(
    ([key, value]) =>
      value !== null &&
      value !== undefined &&
      value !== "" &&
      !["name", "email", "full_name", "fullName"].includes(key)
  );
  const cvUrl = getCvUrl(response.media_list);

  const actions = [
    <Button
      key="status"
      icon={<CheckCircleOutlined />}
      onClick={() => onToggleStatus?.(response)}
      className="headlessbutton headlessbutton-pill !mr-0"
    >
      {isPending ? "Resolve" : "Pending"}
    </Button>,
    <Button
      key="view"
      icon={<EyeOutlined />}
      onClick={() => onView?.(response)}
      className="headlessbutton headlessbutton-pill !mr-0"
    >
      View
    </Button>,
    <Button
      key="edit"
      icon={<EditOutlined />}
      onClick={() => onEdit?.(response)}
      className="headlessbutton headlessbutton-pill !mr-0"
    >
      Edit
    </Button>,
    cvUrl && (
      <Button
        key="cv"
        icon={<DownloadOutlined />}
        onClick={() => window.open(cvUrl, "_blank")}
        className="headlessbutton headlessbutton-pill !mr-0"
      >
        CV
      </Button>
    ),
    <Popconfirm
      key="delete"
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
        className="headlesscancelbutton headlessbutton-pill !mr-0"
        icon={<DeleteOutlined />}
      >
        Delete
      </Button>
    </Popconfirm>,
  ].filter(Boolean);

  return (
    <Card
      hoverable
      actions={actions}
      className="media-card slider-card page-list-card overflow-hidden shadow-md rounded-md"
    >
      <div className="flex flex-1 flex-col pt-3">
        <div className="media-card-meta flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Badge count={`ID-${response.id}`} style={idBadgeStyle} />
            <h3 className="m-0 truncate text-base font-semibold" title={displayName}>
              {displayName}
            </h3>
          </div>
          <h5 className="mb-0 shrink-0 text-sm font-bold capitalize text-gray-400">
            {response.form_type || "Response"}
          </h5>
        </div>

        <Tooltip title={email || submittedAt} placement="topLeft">
          <p className="mt-2 truncate text-sm leading-5 text-gray-500">
            {email || submittedAt || "No email"}
          </p>
        </Tooltip>

        <div className="mt-3 space-y-2 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Status
            </span>
            <Tag className="mb-0 border-gray-200 bg-gray-50 text-gray-700">
              {isPending ? "Pending" : "Resolved"}
            </Tag>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Submitted
            </span>
            <span className="truncate text-sm font-medium text-gray-800">
              {submittedAt}
            </span>
          </div>
          {formDataEntries.slice(0, 4).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                {formatFieldLabel(key)}
              </span>
              <span className="truncate text-sm font-medium text-gray-800">
                {formatFieldValue(key, value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default FormResponseRow;
