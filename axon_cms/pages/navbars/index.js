// pages/Navbars.js

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { message, Drawer, Button, Pagination, Spin } from "antd";
import instance from "../../axios";
import { setPageTitle } from "../../global/constants/pageTitle";
import NavbarHeader from "../../components/Navbars/NavbarHeader";
import AddNavbarForm from "../../components/Navbars/AddNavbarForm";
import NavbarViewDrawer from "../../components/Navbars/NavbarViewDrawer";
import NavbarsList from "../../components/Navbars/NavbarsList";
import { useGlobalRefresh } from "../../src/context/MenuRefreshContext";

const Navbars = () => {
  useEffect(() => {
    setPageTitle("Navbars");
  }, []);

  const [allNavbars, setAllNavbars] = useState([]);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNavbar, setSelectedNavbar] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("desc");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    logo: undefined,
    menu_items: undefined,
  });

  const fetchNavbars = useCallback(async () => {
    try {
      setLoading(true);
      const response = await instance("/navbars");
      if (response.data) {
        setAllNavbars(response.data);
      } else {
        message.error("Navbars couldn't be fetched");
      }
    } catch {
      message.error("Navbars couldn't be fetched");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMedia = useCallback(async () => {
    try {
      const response = await instance("/media");
      if (response.data) setMedia(response.data);
    } catch {
      message.error("Media couldn't be fetched");
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchNavbars(), fetchMedia()]);
  }, [fetchNavbars, fetchMedia]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useGlobalRefresh(refreshAll);

  const filteredNavbars = useMemo(() => {
    let results = [...allNavbars];

    if (searchTerm.trim()) {
      results = results.filter((navbar) =>
        (navbar.title_en || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.logo === "with") {
      results = results.filter((navbar) => navbar.logo_id || navbar.logo?.id);
    } else if (filters.logo === "without") {
      results = results.filter((navbar) => !navbar.logo_id && !navbar.logo?.id);
    }

    if (filters.menu_items === "with") {
      results = results.filter((navbar) => {
        const ids = navbar.menu_item_ids;
        const items = navbar.menu_items;
        if (Array.isArray(items) && items.length) return true;
        if (Array.isArray(ids) && ids.length) return true;
        return false;
      });
    } else if (filters.menu_items === "without") {
      results = results.filter((navbar) => {
        const ids = navbar.menu_item_ids;
        const items = navbar.menu_items;
        const hasItems =
          (Array.isArray(items) && items.length > 0) ||
          (Array.isArray(ids) && ids.length > 0);
        return !hasItems;
      });
    }

    return results;
  }, [allNavbars, searchTerm, filters]);

  const sortedNavbars = useMemo(() => {
    return [...filteredNavbars].sort((a, b) =>
      sortType === "asc" ? a.id - b.id : b.id - a.id
    );
  }, [filteredNavbars, sortType]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters, sortType, itemsPerPage]);

  const paginatedNavbars = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedNavbars.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedNavbars, currentPage, itemsPerPage]);

  const handleAdd = useCallback(() => setIsAddOpen(true), []);
  const handleView = useCallback((navbar) => {
    setSelectedNavbar(navbar);
    setIsViewOpen(true);
  }, []);
  const handleEdit = useCallback((navbar) => {
    setSelectedNavbar(navbar);
    setIsEditOpen(true);
  }, []);

  const handleShowChange = useCallback((value) => {
    setItemsPerPage(parseInt(value, 10));
  }, []);

  const applyFilters = useCallback((filterValues) => {
    setFilters(filterValues);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ logo: undefined, menu_items: undefined });
  }, []);

  const setNavbars = useCallback((updater) => {
    setAllNavbars(updater);
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
      <NavbarHeader
        onAddNavbar={handleAdd}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortType={sortType}
        setSortType={setSortType}
        onShowChange={handleShowChange}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
        onRefresh={refreshAll}
        itemCount={allNavbars.length}
      />

      <Drawer
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        destroyOnClose
        title={
          <div className="flex items-center gap-2">
            <img
              src="/icons/headless/navbar.svg"
              alt="Navbars"
              className="w-6"
            />
            <span>Create Navbar</span>
          </div>
        }
        placement="right"
        width="min(800px, 92vw)"
        rootClassName="media-preview-drawer org-form-drawer"
        footer={
          <div className="flex w-full justify-end">
            <Button
              type="primary"
              form="create-navbar-form"
              htmlType="submit"
              loading={createSubmitting}
              className="headlessbutton headlessbutton-pill !mr-0"
            >
              Create Navbar
            </Button>
          </div>
        }
      >
        {isAddOpen && (
          <AddNavbarForm
            formId="create-navbar-form"
            media={media}
            onCancel={() => setIsAddOpen(false)}
            fetchNavbars={fetchNavbars}
            onLoadingChange={setCreateSubmitting}
            showSubmitButton={false}
          />
        )}
      </Drawer>

      <Drawer
        open={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedNavbar(null);
        }}
        destroyOnClose
        title={
          <div className="flex items-center gap-2">
            <img
              src="/icons/headless/navbar.svg"
              alt="Navbars"
              className="w-6"
            />
            <span>Edit Navbar</span>
          </div>
        }
        placement="right"
        width="min(800px, 92vw)"
        rootClassName="media-preview-drawer org-form-drawer"
        footer={
          <div className="flex w-full justify-end">
            <Button
              type="primary"
              form="edit-navbar-form"
              htmlType="submit"
              loading={editSubmitting}
              className="headlessbutton headlessbutton-pill !mr-0"
            >
              Update Navbar
            </Button>
          </div>
        }
      >
        {isEditOpen && selectedNavbar && (
          <AddNavbarForm
            formId="edit-navbar-form"
            media={media}
            editingNavbar={selectedNavbar}
            onCancel={() => {
              setIsEditOpen(false);
              setSelectedNavbar(null);
            }}
            fetchNavbars={fetchNavbars}
            onLoadingChange={setEditSubmitting}
            showSubmitButton={false}
          />
        )}
      </Drawer>

      <NavbarViewDrawer
        open={isViewOpen}
        navbar={selectedNavbar}
        media={media}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedNavbar(null);
        }}
      />

      <NavbarsList
        navbars={paginatedNavbars}
        media={media}
        setNavbars={setNavbars}
        onView={handleView}
        onEdit={handleEdit}
        onCreate={handleAdd}
      />

      {sortedNavbars.length > itemsPerPage && (
        <div className="mt-4 flex justify-center">
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <Pagination
              current={currentPage}
              pageSize={itemsPerPage}
              total={sortedNavbars.length}
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

export default Navbars;
