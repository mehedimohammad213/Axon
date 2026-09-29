import React from "react";
import { Button, Card, Popconfirm, Switch, Tooltip, Badge } from "antd";
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

const OrganizationRow = ({
  organization,
  onView,
  onEdit,
  onDelete,
  onToggleActive,
  isDeleting,
}) => {
  const userCount = organization.users_count ?? 0;

  const actions = [
    <Button
      key="edit"
      icon={<EditOutlined />}
      onClick={() => onEdit(organization)}
      className="page-card-btn page-card-btn-primary !mr-0"
    >
      Edit
    </Button>,
    <Button
      key="view"
      icon={<EyeOutlined />}
      onClick={() => onView(organization)}
      className="page-card-btn page-card-btn-soft !mr-0"
    >
      Preview
    </Button>,
    <Popconfirm
      key="delete"
      title="Move this organization to trash?"
      description="This only works if the organization has no users."
      onConfirm={() => onDelete(organization.id)}
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
            <Badge count={`ID-${organization.id}`} style={idBadgeStyle} />
            <h3
              className="m-0 truncate text-base font-semibold"
              title={organization.name || "Untitled organization"}
            >
              {organization.name || "Untitled organization"}
            </h3>
          </div>
          <h5 className="mb-0 shrink-0 text-sm font-bold text-gray-400">
            Organization
          </h5>
        </div>

        <Tooltip title={organization.slug || undefined} placement="topLeft">
          <p className="mt-2 truncate text-sm leading-5 text-gray-500">
            {organization.slug || "No slug"}
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
                checked={organization.is_active}
                onChange={(checked) => onToggleActive(organization, checked)}
              />
              <span className="text-sm font-medium text-gray-800">
                {organization.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Users
            </span>
            <span className="text-sm font-medium text-gray-800">
              {userCount} user{userCount !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Email
            </span>
            <span className="truncate text-sm font-medium text-gray-800">
              {organization.email || "—"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Phone
            </span>
            <span className="truncate text-sm font-medium text-gray-800">
              {organization.phone || "—"}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default OrganizationRow;
