import React, { useEffect, useState } from "react";
import {
  Button,
  Drawer,
  Popconfirm,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  CopyOutlined,
  ReloadOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import instance from "../../axios";

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

const OrganizationViewDrawer = ({
  open,
  organization,
  onClose,
  fetchOrganizations,
}) => {
  const [details, setDetails] = useState(organization);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [regeneratingKey, setRegeneratingKey] = useState(false);

  useEffect(() => {
    if (!open || !organization?.id) return;

    const load = async () => {
      setLoading(true);
      try {
        const response = await instance.get(
          `/organizations/${organization.id}`
        );
        if (response.status === 200) {
          setDetails(response.data);
          setUsers(Array.isArray(response.data.users) ? response.data.users : []);
        }
      } catch {
        setDetails(organization);
        message.error("Failed to load organization");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, organization]);

  const copySiteKey = async () => {
    if (!details?.site_key) return;

    try {
      await navigator.clipboard.writeText(details.site_key);
      message.success("Site key copied");
    } catch {
      message.error("Failed to copy site key");
    }
  };

  const regenerateSiteKey = async () => {
    if (!organization?.id) return;

    try {
      setRegeneratingKey(true);
      const response = await instance.post(
        `/organizations/${organization.id}/regenerate-site-key`
      );
      if (response.status === 200) {
        setDetails((current) => ({
          ...current,
          site_key: response.data.site_key,
        }));
        fetchOrganizations?.();
        message.success("Site key regenerated. Update the live website env.");
      }
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Failed to regenerate site key"
      );
    } finally {
      setRegeneratingKey(false);
    }
  };

  const userColumns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Role",
      key: "role",
      render: (_, record) => (
        <Tag color="blue">{record.role_headless?.title || "—"}</Tag>
      ),
    },
  ];

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <img
            src="/icons/headless/settings2.svg"
            alt="Organizations"
            className="w-6"
          />
          <span>View Organization</span>
        </div>
      }
      open={open}
      onClose={onClose}
      placement="right"
      width="min(720px, 92vw)"
      rootClassName="media-preview-drawer"
    >
      {loading && !details ? (
        <div className="flex justify-center py-16">
          <Spin size="large" />
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                #{details?.id}
              </span>
              <span
                className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                  details?.is_active
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {details?.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <h2 className="mt-2 text-xl font-semibold text-gray-900">
              {details?.name || "Organization"}
            </h2>
            <p className="text-sm text-gray-500">{details?.slug}</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
            <dl className="grid gap-4 sm:grid-cols-2">
              <InfoRow label="Name">{details?.name || "—"}</InfoRow>
              <InfoRow label="Slug">{details?.slug || "—"}</InfoRow>
              <InfoRow label="Email">{details?.email || "—"}</InfoRow>
              <InfoRow label="Phone">{details?.phone || "—"}</InfoRow>
              <InfoRow label="Users">
                <span className="inline-flex items-center gap-1">
                  <TeamOutlined />
                  {users.length || details?.users_count || 0}
                </span>
              </InfoRow>
              <InfoRow label="Status">
                {details?.is_active ? "Active" : "Inactive"}
              </InfoRow>
              <div className="sm:col-span-2">
                <InfoRow label="Site key">
                  <Space direction="vertical" size={8} className="w-full">
                    <Typography.Text
                      code
                      className="break-all"
                    >
                      {details?.site_key || "—"}
                    </Typography.Text>
                    <Space>
                      <Button
                        icon={<CopyOutlined />}
                        disabled={!details?.site_key}
                        onClick={copySiteKey}
                      >
                        Copy
                      </Button>
                      <Popconfirm
                        title="Regenerate site key?"
                        description="The live website will stop working until you update HEADLESS_SITE_KEY."
                        okText="Regenerate"
                        cancelText="Cancel"
                        onConfirm={regenerateSiteKey}
                      >
                        <Button
                          icon={<ReloadOutlined />}
                          loading={regeneratingKey}
                          danger
                        >
                          Regenerate
                        </Button>
                      </Popconfirm>
                    </Space>
                  </Space>
                </InfoRow>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-800">Users</h3>
            <Table
              columns={userColumns}
              dataSource={users}
              loading={loading}
              rowKey={(record) => record.id}
              pagination={false}
              locale={{ emptyText: "No users found" }}
              size="small"
            />
          </div>
        </div>
      )}
    </Drawer>
  );
};

export default OrganizationViewDrawer;
