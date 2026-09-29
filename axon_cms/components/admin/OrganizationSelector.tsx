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
    <div
      className="relative box-border flex h-10 min-w-0 items-center gap-2 overflow-hidden
        rounded-lg border border-gray-200 bg-white px-2 shadow-sm transition duration-200
        hover:border-brand/40 hover:shadow-md sm:gap-2.5 sm:px-2.5"
    >
      <div
        className="hidden h-7 shrink-0 items-center whitespace-nowrap rounded-md bg-theme
          px-2.5 text-xs font-bold text-white shadow-sm sm:flex"
        title="Platform Super Admin"
      >
        Super Admin
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
          className="h-10 w-24 sm:w-44 md:w-56
            [&_.ant-select-selector]:!h-10 [&_.ant-select-selector]:!min-h-10
            [&_.ant-select-selector]:!items-center [&_.ant-select-selector]:!bg-transparent
            [&_.ant-select-selector]:!px-0 [&_.ant-select-selector]:!shadow-none
            [&_.ant-select-selection-item]:!leading-10
            [&_.ant-select-selection-item]:!font-semibold
            [&_.ant-select-selection-item]:!text-gray-800
            [&_.ant-select-selection-placeholder]:!leading-10
            [&_.ant-select-selection-placeholder]:!text-gray-400
            [&_.ant-select-arrow]:text-brand"
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
  );
}
