import React from "react";
import { Button, Card, Modal, Popconfirm, Switch, Table, Tooltip } from "antd";
import {
  CaretDownOutlined,
  CaretRightOutlined,
  CloseCircleOutlined,
  DeleteFilled,
  EditOutlined,
  SafetyCertificateOutlined,
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

const RoleRow = ({
  role,
  organizationId,
  isExpanded,
  onExpand,
  onEdit,
  onDelete,
  onToggleStatus,
  onShowPermissions,
  isDeleting,
}) => {
  const permissionCount = role.permission_headless?.length || 0;

  const toggleCard = () => {
    onExpand(role.id);
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
            onExpand(role.id);
          }}
        >
          {isExpanded ? <CaretDownOutlined /> : <CaretRightOutlined />}
        </button>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-brand-light text-brand-dark">
          <SafetyCertificateOutlined className="text-lg" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
              #{role.id}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-brand-light px-2 py-0.5 text-xs font-medium text-brand-dark">
              {permissionCount} permission{permissionCount !== 1 ? "s" : ""}
            </span>
          </div>

          <h3
            className="mt-1.5 min-h-7 truncate text-base font-semibold leading-7 text-gray-900 sm:text-lg"
            title={role.title || "Untitled role"}
          >
            {role.title || "Untitled role"}
          </h3>

          <Tooltip title={role.description || undefined} placement="topLeft">
            <p className="mt-0.5 min-h-5 truncate text-sm leading-5 text-gray-500">
              {role.description || "\u00A0"}
            </p>
          </Tooltip>
        </div>

        <div
          className="flex shrink-0 items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            icon={<EditOutlined />}
            onClick={() => onEdit(role)}
            className="headlessbutton headlessbutton-pill !mr-0"
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this role?"
            description="This cannot be undone."
            onConfirm={() => onDelete(role.id)}
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
              loading={isDeleting}
              className="headlesscancelbutton headlessbutton-pill !mr-0"
            >
              Delete
            </Button>
          </Popconfirm>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-100 px-5 pb-5">
          <div className="pt-4" onClick={(e) => e.stopPropagation()}>
            <dl className="grid gap-4 sm:grid-cols-2">
              <InfoRow label="Role name">{role.title || "—"}</InfoRow>
              <InfoRow label="Status">
                <Switch
                  checked={role.status === 1 || role.status === true}
                  onChange={(checked) =>
                    onToggleStatus(role, checked, organizationId)
                  }
                />
              </InfoRow>
              <InfoRow label="Description">{role.description || "—"}</InfoRow>
              <InfoRow label="Permissions">
                <button
                  type="button"
                  onClick={() => onShowPermissions(role)}
                  className="text-sm font-medium text-brand-dark hover:underline"
                >
                  {permissionCount} assigned
                </button>
              </InfoRow>
            </dl>
          </div>
        </div>
      )}
    </Card>
  );
};

export const RolePermissionsModal = ({ open, onClose, permissions }) => {
  const columns = [
    { title: "Title", dataIndex: "title", key: "title" },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (description) => (
        <Tooltip title={description}>
          <span>
            {description?.length > 24
              ? `${description.substring(0, 24)}...`
              : description}
          </span>
        </Tooltip>
      ),
    },
  ];

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 border-b border-gray-200 pb-4">
          <img
            src="/icons/headless/settings.svg"
            alt="Permissions"
            className="w-6"
          />
          <span>Permissions</span>
        </div>
      }
      open={open}
      onOk={onClose}
      onCancel={onClose}
      footer={[
        <Button
          key="close"
          onClick={onClose}
          className="headlesscancelbutton headlessbutton-pill !mr-0"
        >
          Close
        </Button>,
      ]}
      width={900}
    >
      <Table
        columns={columns}
        dataSource={permissions}
        rowKey={(record) => record.id}
        pagination={false}
      />
    </Modal>
  );
};

export default RoleRow;
