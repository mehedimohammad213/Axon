import React from "react";
import { Avatar, Drawer } from "antd";
import { UserOutlined } from "@ant-design/icons";

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

const UserViewModal = ({ visible, user, onCancel, roles }) => {
  if (!user) return null;

  const roleTitle = user.is_super_admin
    ? "Platform Super Admin"
    : roles?.find((item) => String(item.id) === String(user.role_id))?.title ||
      user.role_headless?.title ||
      "No Role Assigned";

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <img
            src="/icons/headless/user-settings.svg"
            alt="Users"
            className="w-6"
          />
          <span>View User</span>
        </div>
      }
      open={visible}
      onClose={onCancel}
      placement="right"
      width="min(720px, 92vw)"
      rootClassName="media-preview-drawer org-form-drawer"
    >
      <div className="space-y-4">
        <div
          style={{
            border: "1px solid #e8eef5",
            borderRadius: 12,
            padding: 16,
            background: "#ffffff",
          }}
        >
          <div className="flex items-center gap-4">
            <Avatar
              src={user.profile_picture || "/images/profile_avatar.png"}
              icon={<UserOutlined />}
              size={64}
              className="border border-gray-200"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-brand-light px-2 py-0.5 text-xs font-medium text-brand-dark">
                  #{user.id}
                </span>
                <span className="rounded-md bg-brand-light px-2 py-0.5 text-xs font-medium text-brand-dark">
                  {roleTitle}
                </span>
              </div>
              <h2 className="mt-1 truncate text-xl font-semibold text-gray-900">
                {user.name || "Unnamed user"}
              </h2>
              <p className="mb-0 truncate text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>

        <div
          style={{
            border: "1px solid #e8eef5",
            borderRadius: 12,
            padding: 16,
            background: "#ffffff",
          }}
        >
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
    </Drawer>
  );
};

export default UserViewModal;
