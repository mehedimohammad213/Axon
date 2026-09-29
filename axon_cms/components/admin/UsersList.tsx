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
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditDrawerVisible, setIsEditDrawerVisible] = useState(false);
  const [isViewDrawerVisible, setIsViewDrawerVisible] = useState(false);

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

  const openView = (record) => {
    setSelectedUser(record);
    setIsViewDrawerVisible(true);
  };

  const openEdit = (record) => {
    setSelectedUser(record);
    setIsViewDrawerVisible(false);
    setIsEditDrawerVisible(true);
  };

  if (!users.length) {
    return (
      <div className="mt-4 flex items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16">
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
              className="headlessbutton headlessbutton-pill !mr-0 mt-2"
            >
              Create User
            </Button>
          )}
        </Empty>
      </div>
    );
  }

  return (
    <div className="mt-4 media-content-card">
      <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
        {users.map((user) => (
          <UserRow
            key={user.id}
            user={user}
            roles={roles}
            currentUser={currentUser}
            isAdmin={isAdmin}
            onView={openView}
            onEdit={openEdit}
            onDelete={handleDeleteUser}
          />
        ))}
      </div>

      <UserViewModal
        visible={isViewDrawerVisible}
        user={selectedUser}
        roles={roles}
        onCancel={() => setIsViewDrawerVisible(false)}
      />
      <UserEditModal
        visible={isEditDrawerVisible}
        user={selectedUser}
        onCancel={() => setIsEditDrawerVisible(false)}
        fetchUsers={fetchUsers}
        roles={roles}
        currentUser={currentUser}
      />
    </div>
  );
};

export default UsersList;
