// pages/MenuItems.js

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { message, Modal, Pagination, Spin } from "antd";
import instance from "../../axios";
import { setPageTitle } from "../../global/constants/pageTitle";
import MenuItemsHeader from "../../components/MenuItems/MenuItemsHeader";
import AddMenuItemForm from "../../components/MenuItems/AddMenuItemForm";
import MenuItemsList from "../../components/MenuItems/MenuItemsList";
import { useGlobalRefresh } from "../../src/context/MenuRefreshContext";

const LOCAL_KEY_ITEMS = "headless_menuItems";
const LOCAL_KEY_PAGES = "headless_pages";

const MenuItems = () => {
  useEffect(() => {
    setPageTitle("Menu Items");
  }, []);

  const [allMenuItems, setAllMenuItems] = useState([]);
  const [pages, setPages] = useState([]);
  const [editingItemId, setEditingItemId] = useState(null);
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [isAddMenuItemOpen, setIsAddMenuItemOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortType, setSortType] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState({ parent_id: undefined });

  const loadFromLocalStorage = useCallback(() => {
    try {
      const storedItems =
        JSON.parse(localStorage.getItem(LOCAL_KEY_ITEMS)) || [];
      const storedPages =
        JSON.parse(localStorage.getItem(LOCAL_KEY_PAGES)) || [];
      if (storedItems.length > 0) setAllMenuItems(storedItems);
      if (storedPages.length > 0) setPages(storedPages);
    } catch {
      // ignore parse errors
    }
  }, []);

  const fetchMenuItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await instance("/menuitems");
      if (response.data) {
        setAllMenuItems(response.data);
        localStorage.setItem(LOCAL_KEY_ITEMS, JSON.stringify(response.data));
      } else {
        message.error("Menu items couldn't be fetched");
      }
    } catch {
      message.error("Menu items couldn't be fetched");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPages = useCallback(async () => {
    try {
      const response = await instance("/pages");
      if (response.data) {
        setPages(response.data);
        localStorage.setItem(LOCAL_KEY_PAGES, JSON.stringify(response.data));
      }
    } catch {
      message.error("Pages couldn't be fetched");
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchMenuItems(), fetchPages()]);
  }, [fetchMenuItems, fetchPages]);

  useEffect(() => {
    loadFromLocalStorage();
    refreshAll();
  }, [loadFromLocalStorage, refreshAll]);

  useGlobalRefresh(refreshAll);

  const filteredMenuItems = useMemo(() => {
    let results = [...allMenuItems];

    if (searchTerm.trim()) {
      results = results.filter((item) =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.parent_id) {
      results = results.filter(
        (item) => item.parent_id === filters.parent_id
      );
    }

    return results;
  }, [allMenuItems, searchTerm, filters]);

  const sortedMenuItems = useMemo(() => {
    return [...filteredMenuItems].sort((a, b) =>
      sortType === "asc" ? a.id - b.id : b.id - a.id
    );
  }, [filteredMenuItems, sortType]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters, sortType, itemsPerPage]);

  const paginatedMenuItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedMenuItems.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedMenuItems, currentPage, itemsPerPage]);

  const handleExpand = useCallback((itemId) => {
    setExpandedItemId((prev) => (prev === itemId ? null : itemId));
  }, []);

  const handleAddMenuItem = useCallback(() => setIsAddMenuItemOpen(true), []);
  const handleCancelAddMenuItem = useCallback(
    () => setIsAddMenuItemOpen(false),
    []
  );

  const onShowChange = useCallback((value) => {
    setItemsPerPage(parseInt(value, 10));
  }, []);

  const applyFilters = useCallback((filterValues) => {
    setFilters(filterValues);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ parent_id: undefined });
  }, []);

  const setMenuItems = useCallback((updater) => {
    setAllMenuItems(updater);
  }, []);

  if (loading) {
    return (
      <div className="headlesscontainer flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="headlesscontainer rounded-xl bg-gray-50/80 px-4 pt-4 pb-10 sm:px-6 sm:pt-6 sm:pb-12">
      <MenuItemsHeader
        onAddMenuItem={handleAddMenuItem}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortType={sortType}
        setSortType={setSortType}
        onShowChange={onShowChange}
        filterOptions={{ parentItems: allMenuItems }}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
        onRefresh={refreshAll}
        itemCount={allMenuItems.length}
      />

      <Modal
        open={isAddMenuItemOpen}
        onCancel={handleCancelAddMenuItem}
        footer={null}
        title={
          <div className="flex items-center gap-2 border-b border-gray-200 pb-4">
            <img
              src="/icons/headless/menuitems.svg"
              alt="Menu Items"
              className="w-6"
            />
            <span>Add Menu Item</span>
          </div>
        }
        width={800}
      >
        <AddMenuItemForm
          pages={pages}
          menuItems={allMenuItems}
          onCancel={handleCancelAddMenuItem}
          fetchMenuItems={fetchMenuItems}
        />
      </Modal>

      <MenuItemsList
        menuItems={paginatedMenuItems}
        pages={pages}
        allMenuItems={allMenuItems}
        setMenuItems={setMenuItems}
        editingItemId={editingItemId}
        setEditingItemId={setEditingItemId}
        expandedItemId={expandedItemId}
        handleExpand={handleExpand}
        onCreate={handleAddMenuItem}
      />

      {sortedMenuItems.length > itemsPerPage && (
        <div className="mt-4 flex justify-center">
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <Pagination
              current={currentPage}
              pageSize={itemsPerPage}
              total={sortedMenuItems.length}
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

export default MenuItems;
