import { ApartmentOutlined } from "@ant-design/icons";
import { Select, Spin } from "antd";
import { useAuth } from "../../src/context/AuthContext";

export default function OrganizationSelector() {
  const {
    user,
    organization,
    organizations,
    organizationsLoading,
    setSelectedOrganization,
  } = useAuth();

  if (!user?.is_super_admin) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 max-w-full ml-8 md:ml-12 lg:ml-16">
      <div
        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white
          bg-violet-600 shadow-sm whitespace-nowrap"
        title="Platform Super Admin"
      >
        Super Admin
      </div>

      <div className="relative flex min-h-[42px] items-center gap-3 rounded-lg border
        border-gray-200 bg-white px-3 py-1 shadow-sm hover:border-brand/40
        hover:shadow-md transition duration-200"
      >
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
            bg-brand shadow-sm"
        >
          <ApartmentOutlined className="text-sm text-white" />
        </div>

        {organizationsLoading ? (
          <Spin size="small" />
        ) : (
          <Select
            showSearch
            bordered={false}
            variant="borderless"
            placeholder="Select organization"
            value={organization?.id}
            loading={organizationsLoading}
            className="min-w-[260px] [&_.ant-select-arrow]:text-brand
              [&_.ant-select-selection-item]:!font-semibold [&_.ant-select-selection-item]:!text-gray-800
              [&_.ant-select-selection-placeholder]:!text-gray-400
              [&_.ant-select-selector]:!bg-transparent [&_.ant-select-selector]:!px-0
              [&_.ant-select-selector]:!shadow-none"
            optionFilterProp="label"
            options={organizations.map((org) => ({
              value: org.id,
              label: org.name,
            }))}
            onChange={(organizationId) => {
              const selected = organizations.find(
                (org) => org.id === organizationId
              );
              if (selected) {
                setSelectedOrganization(selected);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
