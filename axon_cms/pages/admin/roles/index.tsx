import { useCallback, useEffect, useMemo, useState } from "react";
import { Empty, Drawer, Form, Pagination, Select, Spin, message, Button } from "antd";
import instance from "../../../axios";
import AdminListHeader from "../../../components/admin/AdminListHeader";
import RolesList from "../../../components/admin/RolesList";
import OrgCreateRole from "../../../components/admin/OrgCreateRole";
import { usePermissions } from "../../../src/hooks/usePermissions";
import { useAuth } from "../../../src/context/AuthContext";
import { setPageTitle } from "../../../global/constants/pageTitle";
import { buildApiEndpoint } from "../../../utils/copyApiEndpoint";

const { Option } = Select;

export default function AdminRolesPage() {
  const { canManagePlatform } = usePermissions();
  const { organization } = useAuth();
  const selectedOrgId = organization?.id != null ? String(organization.id) : null;
  const [allRoles, setAllRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("desc");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ status: undefined });

  const canManage = canManagePlatform;

  useEffect(() => {
    setPageTitle("Manage Roles");
  }, []);

  const fetchRoles = useCallback(async (organizationId) => {
    if (!organizationId) {
      setAllRoles([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await instance.get(
        `/organizations/${organizationId}/roles`
      );
      if (response.status === 200) {
        setAllRoles(response.data);
      }
    } catch (error) {
      console.error(error);
      message.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPermissions = useCallback(async () => {
    try {
      const response = await instance.get("/permissions");
      if (response.status === 200) {
        setPermissions(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (canManage) {
      fetchPermissions();
    }
  }, [canManage, fetchPermissions]);

  useEffect(() => {
    if (selectedOrgId) {
      fetchRoles(selectedOrgId);
      setCurrentPage(1);
    } else {
      setAllRoles([]);
      setLoading(false);
    }
  }, [selectedOrgId, fetchRoles]);

  const filteredRoles = useMemo(() => {
    let results = [...allRoles];

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      results = results.filter(
        (role) =>
          role.title?.toLowerCase().includes(query) ||
          role.description?.toLowerCase().includes(query)
      );
    }

    if (filters.status !== undefined) {
      results = results.filter((role) => {
        const isActive = role.status === 1 || role.status === true;
        return isActive === filters.status;
      });
    }

    return results;
  }, [allRoles, searchTerm, filters]);

  const sortedRoles = useMemo(() => {
    return [...filteredRoles].sort((a, b) =>
      sortType === "asc" ? a.id - b.id : b.id - a.id
    );
  }, [filteredRoles, sortType]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters, sortType, itemsPerPage]);

  const paginatedRoles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedRoles.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedRoles, currentPage, itemsPerPage]);

  const handleShowChange = useCallback((value) => {
    setItemsPerPage(parseInt(value, 10));
  }, []);

  const applyFilters = useCallback((filterValues) => {
    setFilters(filterValues);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ status: undefined });
  }, []);

  const refreshRoles = useCallback(() => {
    if (selectedOrgId) {
      fetchRoles(selectedOrgId);
    }
  }, [selectedOrgId, fetchRoles]);

  if (!canManage) {
    return (
      <div className="headlesscontainer px-4 py-6">
        <Empty description="You do not have permission to manage roles." />
      </div>
    );
  }

  if (loading && !allRoles.length) {
    return (
      <div className="headlesscontainer flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="headlesscontainer">
      <AdminListHeader
        title="Manage Roles"
        iconSrc="/icons/headless/settings.svg"
        iconAlt="Manage Roles"
        itemCount={allRoles.length}
        countLabel={{ singular: "Role", plural: "Roles" }}
        createLabel="Create Role"
        onCreate={() => setModalVisible(true)}
        showCreate={Boolean(selectedOrgId)}
        apiEndpoint={
          selectedOrgId
            ? buildApiEndpoint(`/organizations/${selectedOrgId}/roles`)
            : undefined
        }
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchPlaceholder="Search roles..."
        sortType={sortType}
        setSortType={setSortType}
        onShowChange={handleShowChange}
        onRefresh={refreshRoles}
        showFilter
        filterTitle="Filter roles"
        applyFilters={applyFilters}
        resetFilters={resetFilters}
        filterInitialValues={{ status: undefined }}
        renderFilterFields={() => (
          <Form.Item label="Status" name="status">
            <Select placeholder="Select status" allowClear>
              <Option value={true}>Active</Option>
              <Option value={false}>Inactive</Option>
            </Select>
          </Form.Item>
        )}
      />

      <RolesList
        organizationId={selectedOrgId}
        roles={paginatedRoles}
        permissions={permissions}
        fetchRoles={refreshRoles}
        onCreate={() => setModalVisible(true)}
      />

      {sortedRoles.length > itemsPerPage && (
        <div className="mt-4 flex justify-center">
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <Pagination
              current={currentPage}
              pageSize={itemsPerPage}
              total={sortedRoles.length}
              onChange={setCurrentPage}
              showSizeChanger={false}
              className="[&_.ant-pagination-item-active]:border-brand [&_.ant-pagination-item-active_a]:text-brand-dark"
            />
          </div>
        </div>
      )}

      <Drawer
        title={
          <div className="flex items-center gap-2">
            <img
              src="/icons/headless/settings.svg"
              alt="Manage Roles"
              className="w-6"
            />
            <span>
              Create Role
              {organization ? ` — ${organization.name}` : ""}
            </span>
          </div>
        }
        open={modalVisible}
        onClose={() => setModalVisible(false)}
        placement="right"
        width="min(800px, 92vw)"
        destroyOnClose
        rootClassName="media-preview-drawer org-form-drawer"
        footer={
          <div className="flex w-full justify-end">
            <Button
              type="primary"
              form="create-role-form"
              htmlType="submit"
              loading={createSubmitting}
              className="headlessbutton headlessbutton-pill !mr-0"
            >
              Create Role
            </Button>
          </div>
        }
      >
        {selectedOrgId && (
          <OrgCreateRole
            organizationId={selectedOrgId}
            permissions={permissions}
            setModalVisible={setModalVisible}
            fetchRoles={refreshRoles}
            onLoadingChange={setCreateSubmitting}
          />
        )}
      </Drawer>
    </div>
  );
}
