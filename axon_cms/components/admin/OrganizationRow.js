import React from "react";
import { Button, Card, Popconfirm, Switch, Tag, Tooltip } from "antd";
import {
  CaretDownOutlined,
  CaretRightOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  TeamOutlined,
  BankOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/router";

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
        onClick={() => onExpand(organization.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onExpand(organization.id);
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
            <Tag color={organization.is_active ? "green" : "default"}>
              {organization.is_active ? "Active" : "Inactive"}
            </Tag>
            <Tag icon={<TeamOutlined />} color="blue">
              {organization.users_count ?? 0} users
            </Tag>
          </div>

          <h3 className="mt-1.5 truncate text-base font-semibold text-gray-900 sm:text-lg">
            {organization.name}
          </h3>

          <p className="mt-1 truncate text-sm text-gray-500">{organization.slug}</p>
        </div>

        {!isExpanded && (
          <div
            className="flex shrink-0 items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <Tooltip title="Edit organization">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => onEdit(organization)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-brand-light hover:text-brand-dark"
              />
            </Tooltip>
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
                    {organization.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Slug
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-gray-800">
                    {organization.slug}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Email
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-gray-800">
                    {organization.email || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Phone
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-gray-800">
                    {organization.phone || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Status
                  </dt>
                  <dd className="mt-1">
                    <Switch
                      checked={organization.is_active}
                      checkedChildren="Active"
                      unCheckedChildren="Inactive"
                      onChange={(checked) => onToggleActive(organization, checked)}
                    />
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                icon={<EyeOutlined />}
                onClick={() =>
                  router.push(`/admin/organizations/${organization.id}`)
                }
                className="!mr-0 h-9 rounded-lg border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:border-brand hover:text-brand-dark"
              >
                View
              </Button>
              <Button
                icon={<EditOutlined />}
                onClick={() => onEdit(organization)}
                className="!mr-0 h-9 rounded-lg border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:border-brand hover:text-brand-dark"
              >
                Edit
              </Button>
              <Popconfirm
                title="Delete this organization?"
                description="This only works if the organization has no users."
                onConfirm={() => onDelete(organization.id)}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Button
                  icon={<DeleteOutlined />}
                  danger
                  loading={isDeleting}
                  className="!mr-0 ml-auto h-9 rounded-lg px-4 text-sm font-medium"
                >
                  Delete
                </Button>
              </Popconfirm>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default OrganizationRow;
