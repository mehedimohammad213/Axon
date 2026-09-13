import React from "react";
import {
  Avatar,
  Button,
  Card,
  Popconfirm,
  Tooltip,
} from "antd";
import {
  CaretDownOutlined,
  CaretRightOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  UserOutlined,
} from "@ant-design/icons";

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
    const role = roles?.find((item) => String(item.id) === String(roleId));
    return role?.title || "N/A";
  };

  const isPrivilegedRole = (roleId) => {
    const role = roles?.find((item) => String(item.id) === String(roleId));
    return ["Super Admin", "Admin"].includes(role?.title);
  };

  const isSelf = user.id === currentUser?.id;
  const isTargetAdmin = isPrivilegedRole(user.role_id);
  const canEdit = isAdmin && (!isTargetAdmin || isSelf);
  const canDelete = isAdmin && !isTargetAdmin && !isSelf;

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
        onClick={() => onExpand(user.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onExpand(user.id);
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
            onExpand(user.id);
          }}
        >
          {isExpanded ? <CaretDownOutlined /> : <CaretRightOutlined />}
        </button>

        <Avatar
          src={user.profile_picture || "/images/profile_avatar.png"}
          icon={<UserOutlined />}
          className="h-12 w-12 shrink-0 border-2 border-gray-200"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
              #{user.id}
            </span>
            <span className="rounded-md bg-brand-light px-2 py-0.5 text-xs font-medium text-brand-dark">
              {getRoleTitle(user.role_id)}
            </span>
          </div>

          <h3 className="mt-1.5 truncate text-base font-semibold text-gray-900 sm:text-lg">
            {user.name || "Unnamed user"}
          </h3>

          <p className="mt-1 truncate text-sm text-gray-500">{user.email}</p>
        </div>

        {!isExpanded && (
          <div
            className="flex shrink-0 items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <Tooltip title="View user">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => onView(user)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-brand-light hover:text-brand-dark"
              />
            </Tooltip>
            {canEdit && (
              <Tooltip title="Edit user">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => onEdit(user)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-brand-light hover:text-brand-dark"
                />
              </Tooltip>
            )}
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
                    Name
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-gray-800">
                    {user.name || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Email
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-gray-800">
                    {user.email || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Role
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-gray-800">
                    {getRoleTitle(user.role_id)}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                icon={<EyeOutlined />}
                onClick={() => onView(user)}
                className="!mr-0 h-9 rounded-lg border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:border-brand hover:text-brand-dark"
              >
                View
              </Button>
              {canEdit && (
                <Button
                  icon={<EditOutlined />}
                  onClick={() => onEdit(user)}
                  className="!mr-0 h-9 rounded-lg border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:border-brand hover:text-brand-dark"
                >
                  Edit
                </Button>
              )}
              {canDelete && (
                <Popconfirm
                  title="Delete this user?"
                  onConfirm={() => onDelete(user.id)}
                  okText="Delete"
                  cancelText="Cancel"
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    icon={<DeleteOutlined />}
                    danger
                    className="!mr-0 ml-auto h-9 rounded-lg px-4 text-sm font-medium"
                  >
                    Delete
                  </Button>
                </Popconfirm>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default UserRow;
