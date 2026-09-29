import React, { useState } from "react";
import { Button, Empty, Drawer, message } from "antd";
import { PlusOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import instance from "../../axios";
import RoleRow, { RoleViewDrawer } from "./RoleRow";
import EditRole from "../rolepermission/role/EditRole";

const RolesList = ({
  organizationId,
  roles,
  permissions,
  fetchRoles,
  onCreate,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewDrawerVisible, setViewDrawerVisible] = useState(false);
  const [editDrawerVisible, setEditDrawerVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

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

  const openView = (record) => {
    setSelectedRole(record);
    setViewDrawerVisible(true);
  };

  const openEdit = (record) => {
    setSelectedRole(record);
    setViewDrawerVisible(false);
    setEditDrawerVisible(true);
  };

  if (!organizationId) {
    return (
      <div className="mt-4 flex items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16">
        <Empty description="Select an organization to manage roles." />
      </div>
    );
  }

  if (!roles.length) {
    return (
      <div className="mt-4 flex items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16">
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
              className="headlessbutton headlessbutton-pill !mr-0 mt-2"
            >
              Create Role
            </Button>
          )}
        </Empty>
      </div>
    );
  }

  return (
    <div className="mt-4 media-content-card">
      <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
        {roles.map((role) => (
          <RoleRow
            key={role.id}
            role={role}
            organizationId={organizationId}
            onView={openView}
            onEdit={openEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
            isDeleting={isDeleting}
          />
        ))}
      </div>

      <RoleViewDrawer
        open={viewDrawerVisible}
        onClose={() => setViewDrawerVisible(false)}
        role={selectedRole}
      />

      <Drawer
        title={
          <div className="flex items-center gap-2">
            <img
              src="/icons/headless/settings.svg"
              alt="Edit Role"
              className="w-6"
            />
            <span>Edit Role</span>
          </div>
        }
        open={editDrawerVisible}
        onClose={() => {
          setEditDrawerVisible(false);
          setSelectedRole(null);
        }}
        placement="right"
        width="min(800px, 92vw)"
        destroyOnClose
        rootClassName="media-preview-drawer org-form-drawer"
        footer={
          <div className="flex w-full justify-end">
            <Button
              type="primary"
              form="edit-role-form"
              htmlType="submit"
              loading={editSubmitting}
              className="headlessbutton headlessbutton-pill !mr-0"
            >
              Update Role
            </Button>
          </div>
        }
      >
        <EditRole
          role={selectedRole}
          permissions={permissions}
          organizationId={organizationId}
          setModalVisible={setEditDrawerVisible}
          onSuccess={fetchRoles}
          onLoadingChange={setEditSubmitting}
        />
      </Drawer>
    </div>
  );
};

export default RolesList;
