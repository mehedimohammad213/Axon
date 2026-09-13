import React, { useState } from "react";
import { Button, Empty, message } from "antd";
import { BankOutlined, PlusOutlined } from "@ant-design/icons";
import instance from "../../axios";
import OrganizationRow from "./OrganizationRow";

const OrganizationsList = ({
  organizations,
  fetchOrganizations,
  onEdit,
  onCreate,
}) => {
  const [expandedOrgId, setExpandedOrgId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleActive = async (organization, checked) => {
    try {
      await instance.put(`/organizations/${organization.id}`, {
        is_active: checked,
      });
      fetchOrganizations();
      message.success("Organization status updated");
    } catch {
      message.error("Failed to update organization status");
    }
  };

  const handleDelete = async (id) => {
    try {
      setIsDeleting(true);
      await instance.delete(`/organizations/${id}`);
      fetchOrganizations();
      message.success("Organization deleted successfully");
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Failed to delete organization"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (!organizations.length) {
    return (
      <div className="mt-6 flex items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16">
        <Empty
          image={
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-2xl text-brand-dark">
              <BankOutlined />
            </div>
          }
          description={
            <div className="space-y-1">
              <p className="text-base font-medium text-gray-800">
                No organizations yet
              </p>
              <p className="text-sm text-gray-500">
                Create an organization to manage tenants on the platform.
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
              Create organization
            </Button>
          )}
        </Empty>
      </div>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
      {organizations.map((organization) => (
        <OrganizationRow
          key={organization.id}
          organization={organization}
          isExpanded={expandedOrgId === organization.id}
          onExpand={(id) =>
            setExpandedOrgId((prev) => (prev === id ? null : id))
          }
          onEdit={onEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  );
};

export default OrganizationsList;
