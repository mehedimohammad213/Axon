import { useCallback, useEffect, useMemo, useState } from "react";
import { Empty, Form, Pagination, Select, Spin, message } from "antd";
import instance from "../../../axios";
import AdminListHeader from "../../../components/admin/AdminListHeader";
import UsersList from "../../../components/admin/UsersList";
import UserForm from "../../../components/settings/user/UserForm";
import { usePermissions } from "../../../src/hooks/usePermissions";
import { setPageTitle } from "../../../global/constants/pageTitle";

const { Option } = Select;

export default function AdminUsersPage() {
  const { hasPermission, isSuperAdmin, canManagePlatform } = usePermissions();
  const [allUsers, setAllUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [createUser, setCreateUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("desc");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ role_id: undefined });

  const canViewUsers =
    isSuperAdmin ||
    canManagePlatform ||
    hasPermission("view_users") ||
    hasPermission("admin_all");

  const canCreateUser =
    isSuperAdmin ||
    hasPermission("create_users") ||
    hasPermission("admin_all");

  useEffect(() => {
    setPageTitle("Users");
  }, []);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;

    try {
      setCurrentUser(JSON.parse(userStr));
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      message.error("Error loading user data");
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await instance.get("/admin/users");
      if (res.status === 200) {
        setAllUsers(res.data);
      }
    } catch {
      message.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await instance.get("/roles");
      if (res.status === 200 && res.data?.length) {
        setRoles(res.data);
        return;
      }

      setRoles([
        { id: 1, title: "Admin" },
        { id: 2, title: "User" },
      ]);
    } catch {
      setRoles([
        { id: 1, title: "Admin" },
        { id: 2, title: "User" },
      ]);
    }
  }, []);

  useEffect(() => {
    if (canViewUsers) {
      fetchUsers();
      fetchRoles();
    }
  }, [canViewUsers, fetchUsers, fetchRoles]);

  const filteredUsers = useMemo(() => {
    let results = [...allUsers];

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      results = results.filter(
        (user) =>
          user.name?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query)
      );
    }

    if (filters.role_id) {
      results = results.filter(
        (user) => String(user.role_id) === String(filters.role_id)
      );
    }

    return results;
  }, [allUsers, searchTerm, filters]);

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) =>
      sortType === "asc" ? a.id - b.id : b.id - a.id
    );
  }, [filteredUsers, sortType]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters, sortType, itemsPerPage]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedUsers, currentPage, itemsPerPage]);

  const handleShowChange = useCallback((value) => {
    setItemsPerPage(parseInt(value, 10));
  }, []);

  const applyFilters = useCallback((filterValues) => {
    setFilters(filterValues);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ role_id: undefined });
  }, []);

  if (!canViewUsers) {
    return (
      <div className="headlesscontainer px-4 py-6">
        <Empty description="You do not have permission to manage users." />
      </div>
    );
  }

  if (!currentUser) {
    return null;
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
        title="Users"
        iconSrc="/icons/headless/user-settings.svg"
        iconAlt="Users"
        itemCount={allUsers.length}
        countLabel={{ singular: "User", plural: "Users" }}
        createLabel="Add User"
        onCreate={canCreateUser ? () => setCreateUser(true) : undefined}
        showCreate={canCreateUser}
        apiEndpoint={`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/users`}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchPlaceholder="Search users..."
        sortType={sortType}
        setSortType={setSortType}
        onShowChange={handleShowChange}
        onRefresh={fetchUsers}
        showFilter
        filterTitle="Filter users"
        filterOptions={{ roles }}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
        filterInitialValues={{ role_id: undefined }}
        renderFilterFields={({ filterOptions: options }) =>
          options?.roles?.length > 0 ? (
            <Form.Item label="Role" name="role_id">
              <Select placeholder="Select a role" allowClear>
                {options.roles.map((role) => (
                  <Option key={role.id} value={role.id}>
                    {role.title}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          ) : null
        }
      />

      <UsersList
        users={paginatedUsers}
        roles={roles}
        currentUser={currentUser}
        fetchUsers={fetchUsers}
        onCreate={canCreateUser ? () => setCreateUser(true) : undefined}
      />

      {sortedUsers.length > itemsPerPage && (
        <div className="mt-4 flex justify-center">
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <Pagination
              current={currentPage}
              pageSize={itemsPerPage}
              total={sortedUsers.length}
              onChange={setCurrentPage}
              showSizeChanger={false}
              className="[&_.ant-pagination-item-active]:border-brand [&_.ant-pagination-item-active_a]:text-brand-dark"
            />
          </div>
        </div>
      )}

      {createUser && (
        <UserForm
          visible={createUser}
          onCancel={() => setCreateUser(false)}
          fetchUsers={fetchUsers}
          roles={roles}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}
