import React from "react";
import { Button, Card, Popconfirm, Tag, Tooltip, Badge } from "antd";
import {
  CloseCircleOutlined,
  DeleteFilled,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { getTableStats } from "./tableUtils";

const idBadgeStyle = {
  backgroundColor: "#f0f0f0",
  color: "#666",
  fontSize: "12px",
  fontWeight: "500",
};

const isInactive = (status) => status === false || status === 0;

const TableRow = ({ table, onPreview, onEdit, onDelete }) => {
  const { columnCount, rowCount } = getTableStats(table);
  const headers = Array.isArray(table.headers) ? table.headers : [];
  const inactive = isInactive(table.status);

  const actions = [
    <Button
      key="preview"
      icon={<EyeOutlined />}
      onClick={() => onPreview?.(table)}
      className="headlessbutton headlessbutton-pill !mr-0"
    >
      Preview
    </Button>,
    <Button
      key="edit"
      icon={<EditOutlined />}
      onClick={() => onEdit?.(table)}
      className="headlessbutton headlessbutton-pill !mr-0"
    >
      Edit
    </Button>,
    <Popconfirm
      key="delete"
      title="Delete this table?"
      description="This cannot be undone."
      onConfirm={() => onDelete?.(table.id)}
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
            <Badge count={`ID-${table.id}`} style={idBadgeStyle} />
            <h3
              className="m-0 truncate text-base font-semibold"
              title={table.title_en || "Untitled table"}
            >
              {table.title_en || "Untitled table"}
            </h3>
          </div>
          <h5 className="mb-0 shrink-0 text-sm font-bold text-gray-400">
            Table
          </h5>
        </div>

        <Tooltip
          title={table.title_bn || table.page_name || undefined}
          placement="topLeft"
        >
          <p className="mt-2 truncate text-sm leading-5 text-gray-500">
            {table.title_bn || table.page_name || "No alternate title"}
          </p>
        </Tooltip>

        <div className="mt-3 space-y-2 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Page
            </span>
            <span className="truncate text-sm font-medium text-gray-800">
              {table.page_name || "—"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Status
            </span>
            <Tag
              className={`mb-0 ${
                inactive
                  ? "border-gray-200 bg-gray-50 text-gray-600"
                  : "border-gray-200 bg-gray-50 text-gray-700"
              }`}
            >
              {inactive ? "Inactive" : "Active"}
            </Tag>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Size
            </span>
            <span className="text-sm font-medium text-gray-800">
              {columnCount} col{columnCount !== 1 ? "s" : ""} · {rowCount} row
              {rowCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {headers.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {headers.map((header, index) => (
              <Tag
                key={`${header}-${index}`}
                className="m-0 rounded-md border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-700"
              >
                {header}
              </Tag>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default TableRow;
