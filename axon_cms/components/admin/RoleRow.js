import React from "react";
import { Button, Card, Drawer, Popconfirm, Switch, Table, Tag, Tooltip, Badge } from "antd";
import {
  CloseCircleOutlined,
  DeleteFilled,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";

const idBadgeStyle = {
  backgroundColor: "#f0f0f0",
  color: "#666",
  fontSize: "12px",
  fontWeight: "500",
};

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

const RoleRow = ({
  role,
  organizationId,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  isDeleting,
}) => {
  const permissions = role.permission_headless || [];
  const permissionCount = permissions.length;
  const isActive = role.status === 1 || role.status === true;

  const actions = [
    <Button
      key="edit"
      icon={<EditOutlined />}
      onClick={() => onEdit(role)}
      className="page-card-btn page-card-btn-primary !mr-0"
    >
      Edit
    </Button>,
    <Button
      key="view"
      icon={<EyeOutlined />}
      onClick={() => onView(role)}
      className="page-card-btn page-card-btn-soft !mr-0"
    >
      Preview
    </Button>,
    <Popconfirm
      key="delete"
      title="Move this role to trash?"
      description="This cannot be undone."
      onConfirm={() => onDelete(role.id)}
      okText="Move to trash"
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
        className="page-card-btn page-card-btn-danger !mr-0"
        icon={<DeleteOutlined />}
        loading={isDeleting}
      >
        Trash
      </Button>
    </Popconfirm>,
  ];

  return (
    <Card
      hoverable
      actions={actions}
      className="media-card slider-card page-list-card overflow-hidden shadow-md rounded-md"
    >
      <div className="flex flex-1 flex-col pt-3">
        <div className="media-card-meta flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Badge count={`ID-${role.id}`} style={idBadgeStyle} />
            <h3
              className="m-0 truncate text-base font-semibold"
              title={role.title || "Untitled role"}
            >
              {role.title || "Untitled role"}
            </h3>
          </div>
          <h5 className="mb-0 shrink-0 text-sm font-bold text-gray-400">
            Role
          </h5>
        </div>

        <Tooltip title={role.description || undefined} placement="topLeft">
          <p className="mt-2 truncate text-sm leading-5 text-gray-500">
            {role.description || "No description"}
          </p>
        </Tooltip>

        <div className="mt-3 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Status
            </span>
            <div className="flex shrink-0 items-center gap-2">
              <Switch
                size="small"
                checked={isActive}
                onChange={(checked) =>
                  onToggleStatus(role, checked, organizationId)
                }
              />
              <span className="text-sm font-medium text-gray-800">
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Permissions
            </span>
            <span className="text-sm font-medium text-gray-800">
              {permissionCount} assigned
            </span>
          </div>
        </div>

        {permissionCount > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {permissions.slice(0, 6).map((permission) => (
              <Tag
                key={permission.id}
                className="m-0 rounded-md border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-700"
              >
                {permission.title}
              </Tag>
            ))}
            {permissionCount > 6 && (
              <Tag className="m-0 rounded-md border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-700">
                +{permissionCount - 6}
              </Tag>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export const RoleViewDrawer = ({ open, onClose, role }) => {
  const columns = [
    { title: "Title", dataIndex: "title", key: "title" },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (description) => (
        <Tooltip title={description}>
          <span>
            {description?.length > 48
              ? `${description.substring(0, 48)}...`
              : description || "—"}
          </span>
        </Tooltip>
      ),
    },
  ];

  const permissionCount = role?.permission_headless?.length || 0;
  const isActive = role?.status === 1 || role?.status === true;

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <img
            src="/icons/headless/settings.svg"
            alt="Roles"
            className="w-6"
          />
          <span>View Role</span>
        </div>
      }
      open={open}
      onClose={onClose}
      placement="right"
      width="min(720px, 92vw)"
      rootClassName="media-preview-drawer"
    >
      {role && (
        <div className="space-y-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                #{role.id}
              </span>
              <Tag className="mb-0 border-gray-200 bg-gray-50 text-gray-700">
                {isActive ? "Active" : "Inactive"}
              </Tag>
            </div>
            <h2 className="mt-2 text-xl font-semibold text-gray-900">
              {role.title || "Untitled role"}
            </h2>
            {role.description && (
              <p className="mt-1 text-sm text-gray-500">{role.description}</p>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
            <dl className="grid gap-4 sm:grid-cols-2">
              <InfoRow label="Role name">{role.title || "—"}</InfoRow>
              <InfoRow label="Status">{isActive ? "Active" : "Inactive"}</InfoRow>
              <InfoRow label="Permissions">{permissionCount} assigned</InfoRow>
              <InfoRow label="Description">{role.description || "—"}</InfoRow>
            </dl>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-800">
              Permissions
            </h3>
            <Table
              columns={columns}
              dataSource={role.permission_headless || []}
              rowKey={(record) => record.id}
              pagination={false}
              locale={{ emptyText: "No permissions assigned" }}
              size="small"
            />
          </div>
        </div>
      )}
    </Drawer>
  );
};

export default RoleRow;
