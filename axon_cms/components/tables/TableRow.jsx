import React from "react";
import { Button, Card, Popconfirm, Tag, Tooltip } from "antd";
import {
  CaretDownOutlined,
  CaretRightOutlined,
  DeleteFilled,
  EditOutlined,
  EyeOutlined,
  TableOutlined,
} from "@ant-design/icons";
import { getTableStats } from "./tableUtils";

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

const isInactive = (status) => status === false || status === 0;

const TableRow = ({
  table,
  expandedTableId,
  handleExpand,
  onPreview,
  onEdit,
  onDelete,
}) => {
  const isExpanded = expandedTableId === table.id;
  const { columnCount, rowCount } = getTableStats(table);
  const headers = Array.isArray(table.headers) ? table.headers : [];
  const inactive = isInactive(table.status);

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
        onClick={() => handleExpand(table.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleExpand(table.id);
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
            handleExpand(table.id);
          }}
        >
          {isExpanded ? <CaretDownOutlined /> : <CaretRightOutlined />}
        </button>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-brand-light text-brand-dark">
          <TableOutlined className="text-lg" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
              #{table.id}
            </span>
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                inactive
                  ? "bg-gray-100 text-gray-500"
                  : "bg-green-50 text-green-700"
              }`}
            >
              {inactive ? "Inactive" : "Active"}
            </span>
            <span className="rounded-md bg-brand-light px-2 py-0.5 text-xs font-medium text-brand-dark">
              {columnCount} col{columnCount !== 1 ? "s" : ""}
            </span>
            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
              {rowCount} row{rowCount !== 1 ? "s" : ""}
            </span>
          </div>

          <h3 className="mt-1.5 truncate text-base font-semibold text-gray-900 sm:text-lg">
            {table.title_en || "Untitled table"}
          </h3>

          {(table.title_bn || table.page_name) && (
            <p className="mt-0.5 truncate text-sm text-gray-500">
              {table.title_bn || table.page_name}
            </p>
          )}
        </div>

        {!isExpanded && (
          <div
            className="flex shrink-0 items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <Tooltip title="Preview table">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => onPreview?.(table)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-brand-light hover:text-brand-dark"
              />
            </Tooltip>
            <Tooltip title="Edit table">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => onEdit?.(table)}
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
              <div className="space-y-5">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <InfoRow label="Title (English)">
                    {table.title_en || "—"}
                  </InfoRow>
                  <InfoRow label="Title (Bangla)">
                    {table.title_bn || "—"}
                  </InfoRow>
                  <InfoRow label="Page name">
                    {table.page_name || "—"}
                  </InfoRow>
                  <InfoRow label="Status">
                    {inactive ? "Inactive" : "Active"}
                  </InfoRow>
                  <InfoRow label="Columns">{columnCount}</InfoRow>
                  <InfoRow label="Rows">{rowCount}</InfoRow>
                </dl>

                {headers.length > 0 && (
                  <div className="border-t border-gray-100 pt-4">
                    <div className="mb-3 flex items-center gap-2">
                      <TableOutlined className="text-sm text-brand-dark" />
                      <h4 className="text-sm font-semibold text-gray-800">
                        Columns
                      </h4>
                    </div>
                    <ul className="flex flex-wrap gap-2">
                      {headers.map((header, index) => (
                        <li key={`${header}-${index}`}>
                          <Tag className="m-0 rounded-md border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-700">
                            {header}
                          </Tag>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                icon={<EyeOutlined />}
                onClick={() => onPreview?.(table)}
                className="!mr-0 h-9 rounded-lg border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:border-brand hover:text-brand-dark"
              >
                Preview
              </Button>
              <Button
                icon={<EditOutlined />}
                onClick={() => onEdit?.(table)}
                className="!mr-0 h-9 rounded-lg border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:border-brand hover:text-brand-dark"
              >
                Edit
              </Button>
              <Popconfirm
                title="Delete this table?"
                description="This cannot be undone."
                onConfirm={() => onDelete?.(table.id)}
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

export default TableRow;
