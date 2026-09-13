import React, { useState } from "react";
import { Button, Empty, Modal, message } from "antd";
import { PlusOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import instance from "../../axios";
import RoleRow, { RolePermissionsModal } from "./RoleRow";
import EditRole from "../rolepermission/role/EditRole";

const RolesList = ({
  organizationId,
  roles,
  permissions,
  fetchRoles,
  onCreate,
}) => {
  const [expandedRoleId, setExpandedRoleId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const handleToggleStatus = async (role, checked, orgId) => {
    try {
      await instance.put(`/organizations/${orgId}/roles/${role.id}`, {
        status: checked ? 1 : 0,
      });
      fetchRoles();
      message.success("Role status updated successfully");
    } catch {
      message.error("Failed to update role status");
    }
  };

  const handleDelete = async (id) => {
    try {
      setIsDeleting(true);
      await instance.delete(`/organizations/${organizationId}/roles/${id}`);
      fetchRoles();
      message.success("Role deleted successfully");
    } catch (error) {
      message.error(error?.response?.data?.message || "Failed to delete role");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!organizationId) {
    return (
      <div className="mt-6 flex items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16">
        <Empty description="Select an organization to manage roles." />
      </div>
    );
  }

  if (!roles.length) {
    return (
      <div className="mt-6 flex items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16">
        <Empty
          image={
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-2xl text-brand-dark">
              <SafetyCertificateOutlined />
            </div>
          }
          description={
            <div className="space-y-1">
              <p className="text-base font-medium text-gray-800">No roles yet</p>
              <p className="text-sm text-gray-500">
                Create a role to define permissions for this organization.
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
              Add role
            </Button>
          )}
        </Empty>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
        {roles.map((role) => (
          <RoleRow
            key={role.id}
            role={role}
            organizationId={organizationId}
            isExpanded={expandedRoleId === role.id}
            onExpand={(id) =>
              setExpandedRoleId((prev) => (prev === id ? null : id))
            }
            onEdit={(record) => {
              setSelectedRole(record);
              setEditModalVisible(true);
            }}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
            onShowPermissions={(record) => {
              setSelectedPermissions(record.permission_headless || []);
              setViewModalVisible(true);
            }}
            isDeleting={isDeleting}
          />
        ))}
      </div>

      <RolePermissionsModal
        open={viewModalVisible}
        onClose={() => setViewModalVisible(false)}
        permissions={selectedPermissions}
      />

      <Modal
        title="Edit Role"
        open={editModalVisible}
        footer={null}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedRole(null);
        }}
        width={960}
        destroyOnClose
      >
        <EditRole
          role={selectedRole}
          permissions={permissions}
          organizationId={organizationId}
          setModalVisible={setEditModalVisible}
          onSuccess={fetchRoles}
        />
      </Modal>
    </div>
  );
};

export default RolesList;
