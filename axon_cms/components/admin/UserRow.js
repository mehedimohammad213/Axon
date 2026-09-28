import React from "react";
import { Avatar, Button, Card, Popconfirm, Tooltip } from "antd";
import {
  CaretDownOutlined,
  CaretRightOutlined,
  CloseCircleOutlined,
  DeleteFilled,
  EditOutlined,
  EyeOutlined,
  UserOutlined,
} from "@ant-design/icons";

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
  isExpanded,
  onExpand,
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

  const toggleCard = () => {
    onExpand(user.id);
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
            onExpand(user.id);
          }}
        >
          {isExpanded ? <CaretDownOutlined /> : <CaretRightOutlined />}
        </button>

        <Avatar
          src={user.profile_picture || "/images/profile_avatar.png"}
          icon={<UserOutlined />}
          className="h-12 w-12 shrink-0 border border-gray-200"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
              #{user.id}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-brand-light px-2 py-0.5 text-xs font-medium text-brand-dark">
              {roleTitle}
            </span>
          </div>

          <h3
            className="mt-1.5 min-h-7 truncate text-base font-semibold leading-7 text-gray-900 sm:text-lg"
            title={user.name || "Unnamed user"}
          >
            {user.name || "Unnamed user"}
          </h3>

          <Tooltip title={user.email || undefined} placement="topLeft">
            <p className="mt-0.5 min-h-5 truncate text-sm leading-5 text-gray-500">
              {user.email || "\u00A0"}
            </p>
          </Tooltip>
        </div>

        <div
          className="flex shrink-0 flex-wrap items-center justify-end gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            icon={<EyeOutlined />}
            onClick={() => onView(user)}
            className="headlessbutton headlessbutton-pill !mr-0"
          >
            View
          </Button>
          {canEdit && (
            <Button
              icon={<EditOutlined />}
              onClick={() => onEdit(user)}
              className="headlessbutton headlessbutton-pill !mr-0"
            >
              Edit
            </Button>
          )}
          {canDelete && (
            <Popconfirm
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
                icon={<DeleteFilled />}
                className="headlesscancelbutton headlessbutton-pill !mr-0"
              >
                Delete
              </Button>
            </Popconfirm>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-100 px-5 pb-5">
          <div className="pt-4" onClick={(e) => e.stopPropagation()}>
            <dl className="grid gap-4 sm:grid-cols-2">
              <InfoRow label="Name">{user.name || "—"}</InfoRow>
              <InfoRow label="Email">{user.email || "—"}</InfoRow>
              <InfoRow label="Phone">{user.phone || "—"}</InfoRow>
              <InfoRow label="Role">{roleTitle}</InfoRow>
              <InfoRow label="Created">{formatDate(user.created_at)}</InfoRow>
              <InfoRow label="Updated">{formatDate(user.updated_at)}</InfoRow>
            </dl>
          </div>
        </div>
      )}
    </Card>
  );
};

export default UserRow;
