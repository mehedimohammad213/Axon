import React from "react";
import { Avatar, Button, Card, Popconfirm, Tooltip, Badge } from "antd";
import {
  CloseCircleOutlined,
  DeleteFilled,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  UserOutlined,
} from "@ant-design/icons";

const idBadgeStyle = {
  backgroundColor: "#f0f0f0",
  color: "#666",
  fontSize: "12px",
  fontWeight: "500",
};

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

const UserRow = ({
  user,
  roles,
  currentUser,
  isAdmin,
  onView,
  onEdit,
  onDelete,
}) => {
  const getRoleTitle = (roleId) => {
    if (user?.is_super_admin) return "Platform Super Admin";
    const role = roles?.find((item) => String(item.id) === String(roleId));
    return role?.title || user?.role_headless?.title || "N/A";
  };

  const isPrivilegedRole = (roleId) => {
    const role = roles?.find((item) => String(item.id) === String(roleId));
    return ["Super Admin", "Admin"].includes(role?.title);
  };

  const isSelf = user.id === currentUser?.id;
  const isTargetAdmin = isPrivilegedRole(user.role_id);
  const canEdit = isAdmin && (!isTargetAdmin || isSelf);
  const canDelete = isAdmin && !isTargetAdmin && !isSelf;
  const roleTitle = getRoleTitle(user.role_id);

  const actions = [
    <Button
      key="view"
      icon={<EyeOutlined />}
      onClick={() => onView(user)}
      className="headlessbutton headlessbutton-pill !mr-0"
    >
      View
    </Button>,
    canEdit && (
      <Button
        key="edit"
        icon={<EditOutlined />}
        onClick={() => onEdit(user)}
        className="headlessbutton headlessbutton-pill !mr-0"
      >
        Edit
      </Button>
    ),
    canDelete && (
      <Popconfirm
        key="delete"
        title="Delete this user?"
        description="This cannot be undone."
        onConfirm={() => onDelete(user.id)}
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
      </Popconfirm>
    ),
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
            <Badge count={`ID-${user.id}`} style={idBadgeStyle} />
            <h3
              className="m-0 truncate text-base font-semibold"
              title={user.name || "Unnamed user"}
            >
              {user.name || "Unnamed user"}
            </h3>
          </div>
          <h5 className="mb-0 shrink-0 text-sm font-bold text-gray-400">
            {roleTitle}
          </h5>
        </div>

        <Tooltip title={user.email || undefined} placement="topLeft">
          <p className="mt-2 truncate text-sm leading-5 text-gray-500">
            {user.email || "No email"}
          </p>
        </Tooltip>

        <div className="mt-3 space-y-2 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Avatar
            </span>
            <Avatar
              src={user.profile_picture || "/images/profile_avatar.png"}
              icon={<UserOutlined />}
              size={28}
              className="border border-gray-200"
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Phone
            </span>
            <span className="truncate text-sm font-medium text-gray-800">
              {user.phone || "—"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Created
            </span>
            <span className="truncate text-sm font-medium text-gray-800">
              {formatDate(user.created_at)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default UserRow;
