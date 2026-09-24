import { useCallback, useEffect, useMemo, useState } from "react";
import { Empty, Modal, Pagination, Select, Spin, message } from "antd";
import instance from "../../../axios";
import AdminListHeader from "../../../components/admin/AdminListHeader";
import RolesList from "../../../components/admin/RolesList";
import OrgCreateRole from "../../../components/admin/OrgCreateRole";
import { usePermissions } from "../../../src/hooks/usePermissions";
import { setPageTitle } from "../../../global/constants/pageTitle";
import { buildApiEndpoint } from "../../../utils/copyApiEndpoint";

export default function AdminRolesPage() {
  const { canManagePlatform } = usePermissions();
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState(null);
  const [allRoles, setAllRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("desc");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const canManage = canManagePlatform;

  useEffect(() => {
    setPageTitle("Manage Roles");
  }, []);

  const fetchOrganizations = useCallback(async () => {
    try {
      const response = await instance.get("/organizations");
      if (response.status === 200) {
        setOrganizations(response.data);
        setSelectedOrgId((prev) => {
          if (prev) return prev;
          return response.data.length ? String(response.data[0].id) : null;
        });
      }
    } catch (error) {
      console.error(error);
      message.error("Failed to load organizations");
    }
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
      fetchOrganizations();
      fetchPermissions();
    }
  }, [canManage, fetchOrganizations, fetchPermissions]);

  useEffect(() => {
    if (selectedOrgId) {
      fetchRoles(selectedOrgId);
      setCurrentPage(1);
    }
  }, [selectedOrgId, fetchRoles]);

  const filteredRoles = useMemo(() => {
    if (!searchTerm.trim()) return allRoles;
    const query = searchTerm.toLowerCase();
    return allRoles.filter(
      (role) =>
        role.title?.toLowerCase().includes(query) ||
        role.description?.toLowerCase().includes(query)
    );
  }, [allRoles, searchTerm]);

  const sortedRoles = useMemo(() => {
    return [...filteredRoles].sort((a, b) =>
      sortType === "asc" ? a.id - b.id : b.id - a.id
    );
  }, [filteredRoles, sortType]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortType, itemsPerPage]);

  const paginatedRoles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedRoles.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedRoles, currentPage, itemsPerPage]);

  const handleShowChange = useCallback((value) => {
    setItemsPerPage(parseInt(value, 10));
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

  const selectedOrganization = organizations.find(
    (org) => String(org.id) === String(selectedOrgId)
  );

  if (loading && !allRoles.length) {
    return (
      <div className="headlesscontainer flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="headlesscontainer rounded-xl bg-gray-50/80 px-4 pt-4 pb-10 sm:px-6 sm:pt-6 sm:pb-12">
      <AdminListHeader
        title="Manage Roles"
        iconSrc="/icons/headless/settings.svg"
        iconAlt="Manage Roles"
        itemCount={allRoles.length}
        countLabel={{ singular: "Role", plural: "Roles" }}
        createLabel="Add Role"
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
        toolbarExtra={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <span className="text-sm font-medium text-gray-600">Organization</span>
            <Select
              className="w-full sm:min-w-[220px] sm:w-56 [&_.ant-select-selector]:h-9 [&_.ant-select-selector]:rounded-lg [&_.ant-select-selector]:border-gray-200"
              placeholder="Select organization"
              value={selectedOrgId}
              onChange={setSelectedOrgId}
              showSearch
              optionFilterProp="label"
              options={organizations.map((org) => ({
                value: String(org.id),
                label: org.name,
              }))}
            />
          </div>
        }
      />

      {selectedOrganization && (
        <p className="mt-2 text-sm text-gray-500">
          Managing roles for {selectedOrganization.name} ·{" "}
          {selectedOrganization.slug} · {selectedOrganization.users_count ?? 0}{" "}
          users
        </p>
      )}

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

      <Modal
        title={
          <div className="flex items-center gap-2 border-b border-gray-200 pb-4">
            <span>
              Create Role
              {selectedOrganization ? ` — ${selectedOrganization.name}` : ""}
            </span>
          </div>
        }
        open={modalVisible}
        footer={null}
        onCancel={() => setModalVisible(false)}
        width={800}
        destroyOnClose
      >
        {selectedOrgId && (
          <OrgCreateRole
            organizationId={selectedOrgId}
            permissions={permissions}
            setModalVisible={setModalVisible}
            fetchRoles={refreshRoles}
          />
        )}
      </Modal>
    </div>
  );
}
