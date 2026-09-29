// pages/MenuItems.js

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { message, Drawer, Button, Pagination, Spin } from "antd";
import instance from "../../axios";
import { setPageTitle } from "../../global/constants/pageTitle";
import MenuItemsHeader from "../../components/MenuItems/MenuItemsHeader";
import AddMenuItemForm from "../../components/MenuItems/AddMenuItemForm";
import EditMenuItemForm from "../../components/MenuItems/EditMenuItemForm";
import MenuItemViewDrawer from "../../components/MenuItems/MenuItemViewDrawer";
import MenuItemsList from "../../components/MenuItems/MenuItemsList";
import { useGlobalRefresh } from "../../src/context/MenuRefreshContext";

const LOCAL_KEY_ITEMS = "headless_menuItems";
const LOCAL_KEY_PAGES = "headless_pages";

const MenuItems = () => {
  useEffect(() => {
    setPageTitle("Menu");
  }, []);

  const [allMenuItems, setAllMenuItems] = useState([]);
  const [pages, setPages] = useState([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
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
      results = results.filter((item) => item.parent_id === filters.parent_id);
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

  const handleAdd = useCallback(() => setIsAddOpen(true), []);
  const handleView = useCallback((item) => {
    setSelectedMenuItem(item);
    setIsViewOpen(true);
  }, []);
  const handleEdit = useCallback((item) => {
    setSelectedMenuItem(item);
    setIsEditOpen(true);
  }, []);

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
    <div className="headlesscontainer">
      <MenuItemsHeader
        onAddMenuItem={handleAdd}
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

      <Drawer
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <img
              src="/icons/headless/menuitems.svg"
              alt="Menu"
              className="w-6"
            />
            <span>Create Menu</span>
          </div>
        }
        placement="right"
        width="min(720px, 92vw)"
        destroyOnClose
        rootClassName="media-preview-drawer org-form-drawer"
        footer={
          <div className="flex w-full justify-end">
            <Button
              type="primary"
              form="add-menu-item-form"
              htmlType="submit"
              loading={createSubmitting}
              className="headlessbutton headlessbutton-pill !mr-0"
            >
              Create Menu
            </Button>
          </div>
        }
      >
        <AddMenuItemForm
          pages={pages}
          menuItems={allMenuItems}
          onCancel={() => setIsAddOpen(false)}
          fetchMenuItems={fetchMenuItems}
          onLoadingChange={setCreateSubmitting}
          showSubmitButton={false}
        />
      </Drawer>

      <Drawer
        open={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedMenuItem(null);
        }}
        title={
          <div className="flex items-center gap-2">
            <img
              src="/icons/headless/menuitems.svg"
              alt="Menu"
              className="w-6"
            />
            <span>Edit Menu</span>
          </div>
        }
        placement="right"
        width="min(720px, 92vw)"
        destroyOnClose
        rootClassName="media-preview-drawer org-form-drawer"
        footer={
          <div className="flex w-full justify-end">
            <Button
              type="primary"
              form="edit-menu-item-form"
              htmlType="submit"
              loading={editSubmitting}
              className="headlessbutton headlessbutton-pill !mr-0"
            >
              Update Menu
            </Button>
          </div>
        }
      >
        {selectedMenuItem && (
          <EditMenuItemForm
            menuItem={selectedMenuItem}
            pages={pages}
            menuItems={allMenuItems}
            onCancel={() => {
              setIsEditOpen(false);
              setSelectedMenuItem(null);
            }}
            onUpdated={(updated) => {
              if (updated?.id) {
                setAllMenuItems((prev) =>
                  prev.map((item) =>
                    item.id === updated.id ? { ...item, ...updated } : item
                  )
                );
              }
              fetchMenuItems();
            }}
            onLoadingChange={setEditSubmitting}
            showSubmitButton={false}
          />
        )}
      </Drawer>

      <MenuItemViewDrawer
        open={isViewOpen}
        menuItem={selectedMenuItem}
        allMenuItems={allMenuItems}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedMenuItem(null);
        }}
      />

      <MenuItemsList
        menuItems={paginatedMenuItems}
        allMenuItems={allMenuItems}
        setMenuItems={setMenuItems}
        onView={handleView}
        onEdit={handleEdit}
        onCreate={handleAdd}
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
