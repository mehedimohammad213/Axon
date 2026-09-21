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
    <div className="flex max-w-full items-center gap-2 sm:ml-2 md:ml-6 lg:ml-10">
      <div
        className="hidden whitespace-nowrap rounded-lg bg-violet-600 px-3 py-1.5 text-xs
          font-bold text-white shadow-sm md:block"
        title="Platform Super Admin"
      >
        Super Admin
      </div>

      <div className="relative flex min-h-[42px] min-w-0 items-center gap-2 rounded-lg border
        border-gray-200 bg-white px-2 py-1 shadow-sm transition duration-200
        hover:border-brand/40 hover:shadow-md sm:gap-3 sm:px-3"
      >
        <div
          className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg
            bg-brand shadow-sm sm:flex"
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
            placeholder="Organization"
            value={organization?.id}
            loading={organizationsLoading}
            className="w-24 sm:w-44 md:w-56 [&_.ant-select-arrow]:text-brand
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
