import { useCallback, useEffect, useMemo, useState } from "react";
import { Drawer, Empty, Form, Pagination, Select, Spin, message } from "antd";
import instance from "../../../axios";
import AdminListHeader from "../../../components/admin/AdminListHeader";
import OrganizationsList from "../../../components/admin/OrganizationsList";
import CreateOrganization from "../../../components/admin/CreateOrganization";
import EditOrganization from "../../../components/admin/EditOrganization";
import { usePermissions } from "../../../src/hooks/usePermissions";
import { setPageTitle } from "../../../global/constants/pageTitle";
import { buildApiEndpoint } from "../../../utils/copyApiEndpoint";

const { Option } = Select;

export default function OrganizationsPage() {
  const { canManagePlatform } = usePermissions();
  const [allOrganizations, setAllOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDrawerVisible, setCreateDrawerVisible] = useState(false);
  const [editDrawerVisible, setEditDrawerVisible] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("desc");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ is_active: undefined });

  const canManage = canManagePlatform;

  useEffect(() => {
    setPageTitle("Organizations");
  }, []);

  const fetchOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await instance.get("/organizations");
      if (response.status === 200) {
        setAllOrganizations(response.data);
      }
    } catch (error) {
      console.error(error);
      message.error("Failed to load organizations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canManage) {
      fetchOrganizations();
    }
  }, [canManage, fetchOrganizations]);

  const filteredOrganizations = useMemo(() => {
    let results = [...allOrganizations];

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      results = results.filter(
        (org) =>
          org.name?.toLowerCase().includes(query) ||
          org.slug?.toLowerCase().includes(query) ||
          org.email?.toLowerCase().includes(query)
      );
    }

    if (filters.is_active !== undefined) {
      results = results.filter((org) => org.is_active === filters.is_active);
    }

    return results;
  }, [allOrganizations, searchTerm, filters]);

  const sortedOrganizations = useMemo(() => {
    return [...filteredOrganizations].sort((a, b) =>
      sortType === "asc" ? a.id - b.id : b.id - a.id
    );
  }, [filteredOrganizations, sortType]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters, sortType, itemsPerPage]);

  const paginatedOrganizations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedOrganizations.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedOrganizations, currentPage, itemsPerPage]);

  const handleShowChange = useCallback((value) => {
    setItemsPerPage(parseInt(value, 10));
  }, []);

  const applyFilters = useCallback((filterValues) => {
    setFilters(filterValues);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ is_active: undefined });
  }, []);

  const handleEditOrganization = (organization) => {
    setSelectedOrganization(organization);
    setEditDrawerVisible(true);
  };

  if (!canManage) {
    return (
      <div className="headlesscontainer px-4 py-6">
        <Empty description="You do not have permission to manage organizations." />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="headlesscontainer flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="headlesscontainer rounded-xl bg-gray-50/80 px-4 pt-4 pb-10 sm:px-6 sm:pt-6 sm:pb-12">
      <AdminListHeader
        title="Organizations"
        iconSrc="/icons/headless/settings2.svg"
        iconAlt="Organizations"
        itemCount={allOrganizations.length}
        countLabel={{ singular: "Organization", plural: "Organizations" }}
        createLabel="Create Organization"
        onCreate={() => setCreateDrawerVisible(true)}
        apiEndpoint={buildApiEndpoint("/organizations")}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchPlaceholder="Search organizations..."
        sortType={sortType}
        setSortType={setSortType}
        onShowChange={handleShowChange}
        onRefresh={fetchOrganizations}
        showFilter
        filterTitle="Filter organizations"
        applyFilters={applyFilters}
        resetFilters={resetFilters}
        filterInitialValues={{ is_active: undefined }}
        renderFilterFields={() => (
          <Form.Item label="Status" name="is_active">
            <Select placeholder="Select status" allowClear>
              <Option value={true}>Active</Option>
              <Option value={false}>Inactive</Option>
            </Select>
          </Form.Item>
        )}
      />

      <OrganizationsList
        organizations={paginatedOrganizations}
        fetchOrganizations={fetchOrganizations}
        onEdit={handleEditOrganization}
        onCreate={() => setCreateDrawerVisible(true)}
      />

      {sortedOrganizations.length > itemsPerPage && (
        <div className="mt-4 flex justify-center">
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <Pagination
              current={currentPage}
              pageSize={itemsPerPage}
              total={sortedOrganizations.length}
              onChange={setCurrentPage}
              showSizeChanger={false}
              className="[&_.ant-pagination-item-active]:border-brand [&_.ant-pagination-item-active_a]:text-brand-dark"
            />
          </div>
        </div>
      )}

      <Drawer
        title="Create Organization"
        placement="right"
        open={createDrawerVisible}
        onClose={() => setCreateDrawerVisible(false)}
        width="min(720px, 92vw)"
        destroyOnClose
      >
        <CreateOrganization
          setModalVisible={setCreateDrawerVisible}
          fetchOrganizations={fetchOrganizations}
        />
      </Drawer>

      <Drawer
        title="Edit Organization"
        placement="right"
        open={editDrawerVisible}
        onClose={() => {
          setEditDrawerVisible(false);
          setSelectedOrganization(null);
        }}
        width="min(720px, 92vw)"
        destroyOnClose
      >
        <EditOrganization
          organization={selectedOrganization}
          setModalVisible={setEditDrawerVisible}
          fetchOrganizations={fetchOrganizations}
        />
      </Drawer>
    </div>
  );
}
