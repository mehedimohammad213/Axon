import React from "react";
import { Button, Card, Popconfirm, Switch, Tooltip } from "antd";
import {
  BankOutlined,
  CaretDownOutlined,
  CaretRightOutlined,
  CloseCircleOutlined,
  DeleteFilled,
  EditOutlined,
  EyeOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/router";

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

const OrganizationRow = ({
  organization,
  isExpanded,
  onExpand,
  onEdit,
  onDelete,
  onToggleActive,
  isDeleting,
}) => {
  const router = useRouter();
  const userCount = organization.users_count ?? 0;

  const toggleCard = () => {
    onExpand(organization.id);
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
            onExpand(organization.id);
          }}
        >
          {isExpanded ? <CaretDownOutlined /> : <CaretRightOutlined />}
        </button>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-brand-light text-brand-dark">
          <BankOutlined className="text-lg" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
              #{organization.id}
            </span>
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                organization.is_active
                  ? "bg-green-50 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {organization.is_active ? "Active" : "Inactive"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-brand-light px-2 py-0.5 text-xs font-medium text-brand-dark">
              <TeamOutlined className="text-[10px]" />
              {userCount} user{userCount !== 1 ? "s" : ""}
            </span>
          </div>

          <h3
            className="mt-1.5 min-h-7 truncate text-base font-semibold leading-7 text-gray-900 sm:text-lg"
            title={organization.name || "Untitled organization"}
          >
            {organization.name || "Untitled organization"}
          </h3>

          <Tooltip title={organization.slug || undefined} placement="topLeft">
            <p className="mt-0.5 min-h-5 truncate text-sm leading-5 text-gray-500">
              {organization.slug || "\u00A0"}
            </p>
          </Tooltip>
        </div>

        <div
          className="flex shrink-0 flex-wrap items-center justify-end gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            icon={<EyeOutlined />}
            onClick={() =>
              router.push(`/admin/organizations/${organization.id}`)
            }
            className="headlessbutton headlessbutton-pill !mr-0"
          >
            View
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={() => onEdit(organization)}
            className="headlessbutton headlessbutton-pill !mr-0"
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this organization?"
            description="This only works if the organization has no users."
            onConfirm={() => onDelete(organization.id)}
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
              <InfoRow label="Name">{organization.name || "—"}</InfoRow>
              <InfoRow label="Slug">{organization.slug || "—"}</InfoRow>
              <InfoRow label="Email">{organization.email || "—"}</InfoRow>
              <InfoRow label="Phone">{organization.phone || "—"}</InfoRow>
              <InfoRow label="Users">{userCount}</InfoRow>
              <InfoRow label="Status">
                <Switch
                  checked={organization.is_active}
                  checkedChildren="Active"
                  unCheckedChildren="Inactive"
                  onChange={(checked) => onToggleActive(organization, checked)}
                />
              </InfoRow>
            </dl>
          </div>
        </div>
      )}
    </Card>
  );
};

export default OrganizationRow;
