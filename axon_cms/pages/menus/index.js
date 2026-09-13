// pages/Menus.js

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { message, Modal, Pagination, Spin } from "antd";
import instance from "../../axios";
import { setPageTitle } from "../../global/constants/pageTitle";
import MenusHeader from "../../components/Menus/MenusHeader";
import AddMenuForm from "../../components/Menus/AddMenuForm";
import MenusList from "../../components/Menus/MenusList";
import { useGlobalRefresh } from "../../src/context/MenuRefreshContext";

const Menus = () => {
  useEffect(() => {
    setPageTitle("Menus");
  }, []);

  const [allMenus, setAllMenus] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMenuId, setEditingMenuId] = useState(null);
  const [expandedMenuId, setExpandedMenuId] = useState(null);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("desc");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ menu_item_id: undefined });

  const fetchMenus = useCallback(async () => {
    try {
      setLoading(true);
      const response = await instance("/menus");
      if (response.data) {
        setAllMenus(response.data);
      } else {
        message.error("Menus couldn't be fetched");
      }
    } catch {
      message.error("Menus couldn't be fetched");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMenuItems = useCallback(async () => {
    try {
      const response = await instance("/menuitems");
      if (response.data) setMenuItems(response.data);
    } catch {
      message.error("Menu items couldn't be fetched");
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchMenus(), fetchMenuItems()]);
  }, [fetchMenus, fetchMenuItems]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useGlobalRefresh(refreshAll);

  const filteredMenus = useMemo(() => {
    let results = [...allMenus];

    if (searchTerm.trim()) {
      results = results.filter((menu) =>
        menu.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.menu_item_id) {
      const filterId = String(filters.menu_item_id);
      results = results.filter((menu) => {
        if (Array.isArray(menu.menu_items) && menu.menu_items.length) {
          return menu.menu_items.some(
            (item) => String(item.id) === filterId
          );
        }
        const ids = Array.isArray(menu.menu_item_ids)
          ? menu.menu_item_ids
          : [];
        return ids.some((id) => String(id) === filterId);
      });
    }

    return results;
  }, [allMenus, searchTerm, filters]);

  const sortedMenus = useMemo(() => {
    return [...filteredMenus].sort((a, b) =>
      sortType === "asc" ? a.id - b.id : b.id - a.id
    );
  }, [filteredMenus, sortType]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters, sortType, itemsPerPage]);

  const paginatedMenus = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedMenus.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedMenus, currentPage, itemsPerPage]);

  const handleExpand = useCallback((menuId) => {
    setExpandedMenuId((prev) => (prev === menuId ? null : menuId));
  }, []);

  const handleAddMenu = useCallback(() => setIsAddMenuOpen(true), []);
  const handleCancelAddMenu = useCallback(() => setIsAddMenuOpen(false), []);

  const handleShowChange = useCallback((value) => {
    setItemsPerPage(parseInt(value, 10));
  }, []);

  const applyFilters = useCallback((filterValues) => {
    setFilters(filterValues);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ menu_item_id: undefined });
  }, []);

  const setMenus = useCallback((updater) => {
    setAllMenus(updater);
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
      <MenusHeader
        onAddMenu={handleAddMenu}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortType={sortType}
        setSortType={setSortType}
        onShowChange={handleShowChange}
        filterOptions={{ menuItems }}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
        onRefresh={refreshAll}
        itemCount={allMenus.length}
      />

      <Modal
        open={isAddMenuOpen}
        onCancel={handleCancelAddMenu}
        footer={null}
        title={
          <div className="flex items-center gap-2 border-b border-gray-200 pb-4">
            <img src="/icons/headless/menus.svg" alt="Menus" className="w-6" />
            <span>Add Menu</span>
          </div>
        }
        width={800}
      >
        <AddMenuForm
          menuItems={menuItems}
          onCancel={handleCancelAddMenu}
          fetchMenus={fetchMenus}
        />
      </Modal>

      <MenusList
        menus={paginatedMenus}
        menuItems={menuItems}
        setMenus={setMenus}
        editingMenuId={editingMenuId}
        setEditingMenuId={setEditingMenuId}
        expandedMenuId={expandedMenuId}
        handleExpand={handleExpand}
        onCreate={handleAddMenu}
      />

      {sortedMenus.length > itemsPerPage && (
        <div className="mt-4 flex justify-center">
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <Pagination
              current={currentPage}
              pageSize={itemsPerPage}
              total={sortedMenus.length}
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

export default Menus;
