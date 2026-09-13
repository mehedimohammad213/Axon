import React, { useState } from "react";
import { Button, Empty, message } from "antd";
import { PlusOutlined, UserOutlined } from "@ant-design/icons";
import UserRow from "./UserRow";
import UserEditModal from "../settings/userv2/UserEditModal";
import UserViewModal from "../settings/userv2/UserViewModal";
import instance from "../../axios";
import { usePermissions } from "../../src/hooks/usePermissions";

const UsersList = ({
  users,
  roles,
  currentUser,
  fetchUsers,
  onCreate,
}) => {
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);

  const { hasPermission, isSuperAdmin } = usePermissions();
  const isAdmin =
    isSuperAdmin || hasPermission("edit_users") || hasPermission("admin_all");

  const isPrivilegedRole = (roleId) => {
    const role = roles?.find((item) => String(item.id) === String(roleId));
    return ["Super Admin", "Admin"].includes(role?.title);
  };

  const handleDeleteUser = async (id) => {
    const targetUser = users.find((u) => u.id === id);

    if (isPrivilegedRole(targetUser?.role_id)) {
      message.error("You cannot delete admin users");
      return;
    }

    if (targetUser?.id === currentUser?.id) {
      message.error("You cannot delete your own account");
      return;
    }

    try {
      await instance.delete(`/admin/user/${id}`);
      message.success("User deleted successfully");
      fetchUsers();
    } catch {
      message.error("Failed to delete user");
    }
  };

  if (!users.length) {
    return (
      <div className="mt-6 flex items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16">
        <Empty
          image={
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-2xl text-brand-dark">
              <UserOutlined />
            </div>
          }
          description={
            <div className="space-y-1">
              <p className="text-base font-medium text-gray-800">No users yet</p>
              <p className="text-sm text-gray-500">
                Add a user to manage access for your workspace.
              </p>
            </div>
          }
        >
          {onCreate && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onCreate}
              className="mt-2 bg-brand hover:bg-brand-dark"
            >
              Add user
            </Button>
          )}
        </Empty>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
        {users.map((user) => (
          <UserRow
            key={user.id}
            user={user}
            roles={roles}
            currentUser={currentUser}
            isAdmin={isAdmin}
            isExpanded={expandedUserId === user.id}
            onExpand={(id) =>
              setExpandedUserId((prev) => (prev === id ? null : id))
            }
            onView={(record) => {
              setSelectedUser(record);
              setIsViewModalVisible(true);
            }}
            onEdit={(record) => {
              setSelectedUser(record);
              setIsEditModalVisible(true);
            }}
            onDelete={handleDeleteUser}
          />
        ))}
      </div>

      <UserEditModal
        visible={isEditModalVisible}
        user={selectedUser}
        onCancel={() => setIsEditModalVisible(false)}
        fetchUsers={fetchUsers}
        roles={roles}
        currentUser={currentUser}
      />
      <UserViewModal
        visible={isViewModalVisible}
        user={selectedUser}
        onCancel={() => setIsViewModalVisible(false)}
        onEdit={() => {
          setIsViewModalVisible(false);
          setIsEditModalVisible(true);
        }}
        currentUser={currentUser}
      />
    </div>
  );
};

export default UsersList;
