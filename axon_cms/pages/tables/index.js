import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pagination, Spin, message } from "antd";
import instance from "../../axios";
import { setPageTitle } from "../../global/constants/pageTitle";
import { useGlobalRefresh } from "../../src/context/MenuRefreshContext";
import TablesHeader from "../../components/tables/TablesHeader";
import TablesList from "../../components/tables/TablesList";
import TableFormDrawer from "../../components/tables/TableFormDrawer";
import TablePreviewDrawer from "../../components/tables/TablePreviewDrawer";

const TablesPage = () => {
  useEffect(() => {
    setPageTitle("Tables");
  }, []);

  const [loading, setLoading] = useState(true);
  const [allTables, setAllTables] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState({ status: undefined });
  const [expandedTableId, setExpandedTableId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [previewTable, setPreviewTable] = useState(null);

  const fetchTables = useCallback(async () => {
    try {
      setLoading(true);
      const response = await instance.get("/tables");
      if (response.status === 200 && Array.isArray(response.data)) {
        setAllTables(response.data);
      } else {
        message.error("Failed to fetch tables.");
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
      message.error("Failed to fetch tables.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  useGlobalRefresh(fetchTables);

  const filteredTables = useMemo(() => {
    let results = [...allTables];
    const term = searchTerm.trim().toLowerCase();

    if (term) {
      results = results.filter((table) => {
        const haystack = [
          table.title_en,
          table.title_bn,
          table.page_name,
          String(table.id),
          ...(Array.isArray(table.headers) ? table.headers : []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(term);
      });
    }

    if (filters.status === "active") {
      results = results.filter(
        (table) => table.status !== false && table.status !== 0
      );
    } else if (filters.status === "inactive") {
      results = results.filter(
        (table) => table.status === false || table.status === 0
      );
    }

    return results;
  }, [allTables, searchTerm, filters]);

  const sortedTables = useMemo(() => {
    return [...filteredTables].sort((a, b) =>
      sortType === "asc" ? a.id - b.id : b.id - a.id
    );
  }, [filteredTables, sortType]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters, sortType, itemsPerPage]);

  const paginatedTables = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedTables.slice(start, start + itemsPerPage);
  }, [sortedTables, currentPage, itemsPerPage]);

  const handleExpand = useCallback((tableId) => {
    setExpandedTableId((prev) => (prev === tableId ? null : tableId));
  }, []);

  const handleAddTable = useCallback(() => {
    setEditingTable(null);
    setIsFormOpen(true);
  }, []);

  const handleShowChange = useCallback((value) => {
    setItemsPerPage(parseInt(value, 10));
  }, []);

  const applyFilters = useCallback((filterValues) => {
    setFilters(filterValues);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ status: undefined });
  }, []);

  const handleDelete = async (id) => {
    try {
      await instance.delete(`/tables/${id}`);
      message.success("Table deleted successfully.");
      setAllTables((prev) => prev.filter((table) => table.id !== id));
      if (expandedTableId === id) setExpandedTableId(null);
    } catch (error) {
      console.error("Error deleting table:", error);
      message.error("Failed to delete table.");
    }
  };

  if (loading) {
    return (
      <div className="headlesscontainer flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="headlesscontainer rounded-xl bg-gray-50/80 px-4 pt-4 pb-10 sm:px-6 sm:pt-6 sm:pb-12">
      <TablesHeader
        onAddTable={handleAddTable}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortType={sortType}
        setSortType={setSortType}
        onShowChange={handleShowChange}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
        onRefresh={fetchTables}
        itemCount={allTables.length}
      />

      <TablesList
        tables={paginatedTables}
        expandedTableId={expandedTableId}
        handleExpand={handleExpand}
        onPreview={setPreviewTable}
        onEdit={(table) => {
          setEditingTable(table);
          setIsFormOpen(true);
        }}
        onDelete={handleDelete}
        onCreate={handleAddTable}
      />

      {sortedTables.length > itemsPerPage && (
        <div className="mt-4 flex justify-center">
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <Pagination
              current={currentPage}
              pageSize={itemsPerPage}
              total={sortedTables.length}
              onChange={setCurrentPage}
              showSizeChanger={false}
              className="[&_.ant-pagination-item-active]:border-brand [&_.ant-pagination-item-active_a]:text-brand-dark"
            />
          </div>
        </div>
      )}

      <TableFormDrawer
        open={isFormOpen}
        editingTable={editingTable}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTable(null);
        }}
        onSuccess={() => {
          fetchTables();
        }}
      />

      <TablePreviewDrawer
        open={Boolean(previewTable)}
        table={previewTable}
        onClose={() => setPreviewTable(null)}
      />
    </div>
  );
};

export default TablesPage;
