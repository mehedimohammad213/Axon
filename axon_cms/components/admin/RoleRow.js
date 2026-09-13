import React from "react";
import { Button, Card, Modal, Popconfirm, Switch, Table, Tooltip } from "antd";
import {
  CaretDownOutlined,
  CaretRightOutlined,
  DeleteOutlined,
  EditOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

const RoleRow = ({
  role,
  organizationId,
  isExpanded,
  onExpand,
  onEdit,
  onDelete,
  onToggleStatus,
  onShowPermissions,
  isDeleting,
}) => {
  const permissionCount = role.permission_headless?.length || 0;

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
        onClick={() => onExpand(role.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onExpand(role.id);
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
            onExpand(role.id);
          }}
        >
          {isExpanded ? <CaretDownOutlined /> : <CaretRightOutlined />}
        </button>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-brand-light text-brand-dark">
          <SafetyCertificateOutlined className="text-lg" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
              #{role.id}
            </span>
            <span className="rounded-md bg-brand-light px-2 py-0.5 text-xs font-medium text-brand-dark">
              {permissionCount} permission{permissionCount !== 1 ? "s" : ""}
            </span>
          </div>

          <h3 className="mt-1.5 truncate text-base font-semibold text-gray-900 sm:text-lg">
            {role.title || "Untitled role"}
          </h3>

          {role.description && (
            <p className="mt-1 line-clamp-2 text-sm text-gray-500">
              {role.description}
            </p>
          )}
        </div>

        {!isExpanded && (
          <div
            className="flex shrink-0 items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <Tooltip title="Edit role">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => onEdit(role)}
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
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Role name
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-gray-800">
                    {role.title || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Status
                  </dt>
                  <dd className="mt-1">
                    <Switch
                      checked={role.status === 1 || role.status === true}
                      onChange={(checked) =>
                        onToggleStatus(role, checked, organizationId)
                      }
                    />
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Description
                  </dt>
                  <dd className="mt-1 text-sm text-gray-700">
                    {role.description || "—"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={() => onShowPermissions(role)}
                className="!mr-0 h-9 rounded-lg border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:border-brand hover:text-brand-dark"
              >
                Permissions
              </Button>
              <Button
                icon={<EditOutlined />}
                onClick={() => onEdit(role)}
                className="!mr-0 h-9 rounded-lg border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:border-brand hover:text-brand-dark"
              >
                Edit
              </Button>
              <Popconfirm
                title="Delete this role?"
                onConfirm={() => onDelete(role.id)}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Button
                  icon={<DeleteOutlined />}
                  danger
                  loading={isDeleting}
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

export const RolePermissionsModal = ({
  open,
  onClose,
  permissions,
}) => {
  const columns = [
    { title: "Title", dataIndex: "title", key: "title" },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (description) => (
        <Tooltip title={description}>
          <span>
            {description?.length > 24
              ? `${description.substring(0, 24)}...`
              : description}
          </span>
        </Tooltip>
      ),
    },
  ];

  return (
    <Modal
      title="Permissions"
      open={open}
      onOk={onClose}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      width={900}
    >
      <Table
        columns={columns}
        dataSource={permissions}
        rowKey={(record) => record.id}
        pagination={false}
      />
    </Modal>
  );
};

export default RoleRow;
