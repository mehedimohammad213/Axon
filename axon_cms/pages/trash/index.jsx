import React, { useCallback, useEffect, useMemo, useState } from "react";
import { message, Pagination, Spin } from "antd";
import instance from "../../axios";
import { setPageTitle } from "../../global/constants/pageTitle";
import TrashHeader from "../../components/Trash/TrashHeader";
import TrashList from "../../components/Trash/TrashList";
import { useGlobalRefresh } from "../../src/context/MenuRefreshContext";

const TrashPage = () => {
  useEffect(() => {
    setPageTitle("Trash");
  }, []);

  const [items, setItems] = useState([]);
  const [byType, setByType] = useState({});
  const [loading, setLoading] = useState(true);
  const [sortType, setSortType] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedType, setSelectedType] = useState("all");
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [busyKey, setBusyKey] = useState("");

  const fetchTrash = useCallback(async () => {
    setLoading(true);
    try {
      const response = await instance.get("/trash");
      const list = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      const counts = response.meta?.byType || response.data?.meta?.byType || {};
      setItems(list);
      setByType(counts);
    } catch (error) {
      console.error("Error fetching trash:", error);
      message.error(error?.response?.data?.message || "Failed to load trash.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrash();
  }, [fetchTrash]);

  useGlobalRefresh(fetchTrash);

  const typeOptions = useMemo(() => {
    const keys = Object.keys(byType);
    return [
      { value: "all", label: `All (${items.length})` },
      ...keys.map((type) => {
        const label =
          items.find((item) => item.type === type)?.type_label || type;
        return { value: type, label: `${label} (${byType[type]})` };
      }),
    ];
  }, [byType, items]);

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return items.filter((item) => {
      const matchesType = selectedType === "all" || item.type === selectedType;
      const matchesSearch =
        !term ||
        item.title?.toLowerCase().includes(term) ||
        item.type_label?.toLowerCase().includes(term) ||
        String(item.id).includes(term);
      return matchesType && matchesSearch;
    });
  }, [items, searchTerm, selectedType]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const aTime = a.deleted_at ? new Date(a.deleted_at).getTime() : 0;
      const bTime = b.deleted_at ? new Date(b.deleted_at).getTime() : 0;
      return sortType === "asc" ? aTime - bTime : bTime - aTime;
    });
  }, [filteredItems, sortType]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedType, sortType, itemsPerPage]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedItems.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedItems, currentPage, itemsPerPage]);

  const itemKey = (item) => `${item.type}-${item.id}`;

  const handleExpand = useCallback((itemId) => {
    setExpandedItemId((prev) => (prev === itemId ? null : itemId));
  }, []);

  const onShowChange = useCallback((value) => {
    setItemsPerPage(parseInt(value, 10));
  }, []);

  const applyFilters = useCallback((filterValues) => {
    setSelectedType(filterValues.type || "all");
  }, []);

  const resetFilters = useCallback(() => {
    setSelectedType("all");
  }, []);

  const handleRestore = async (item) => {
    const key = itemKey(item);
    try {
      setBusyKey(key);
      await instance.post(`/trash/${item.type}/${item.id}/restore`);
      message.success(`${item.type_label} restored successfully.`);
      await fetchTrash();
    } catch (error) {
      message.error(error?.response?.data?.message || "Failed to restore item.");
    } finally {
      setBusyKey("");
    }
  };

  const handlePermanentDelete = async (item) => {
    const key = itemKey(item);
    try {
      setBusyKey(key);
      await instance.delete(`/trash/${item.type}/${item.id}`);
      message.success(`${item.type_label} permanently deleted.`);
      await fetchTrash();
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Failed to permanently delete item."
      );
    } finally {
      setBusyKey("");
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
      <TrashHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortType={sortType}
        setSortType={setSortType}
        onShowChange={onShowChange}
        typeOptions={typeOptions}
        selectedType={selectedType}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
        onRefresh={fetchTrash}
        itemCount={items.length}
      />

      <TrashList
        items={paginatedItems}
        expandedItemId={expandedItemId}
        handleExpand={handleExpand}
        onRestore={handleRestore}
        onDelete={handlePermanentDelete}
        busyKey={busyKey}
        itemKey={itemKey}
        isEmptyTrash={items.length === 0}
      />

      {sortedItems.length > itemsPerPage && (
        <div className="mt-4 flex justify-center">
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <Pagination
              current={currentPage}
              pageSize={itemsPerPage}
              total={sortedItems.length}
              onChange={setCurrentPage}
              showSizeChanger={false}
              className="[&_.ant-pagination-item-active]:border-brand [&_.ant-pagination-item-active_a]:text-brand-dark"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TrashPage;
