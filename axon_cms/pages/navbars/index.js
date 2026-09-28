// pages/Navbars.js

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { message, Modal, Pagination, Spin } from "antd";
import instance from "../../axios";
import { setPageTitle } from "../../global/constants/pageTitle";
import NavbarHeader from "../../components/Navbars/NavbarHeader";
import AddNavbarForm from "../../components/Navbars/AddNavbarForm";
import NavbarsList from "../../components/Navbars/NavbarsList";
import { useGlobalRefresh } from "../../src/context/MenuRefreshContext";

const Navbars = () => {
  useEffect(() => {
    setPageTitle("Navbars");
  }, []);

  const [allNavbars, setAllNavbars] = useState([]);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingNavbarId, setEditingNavbarId] = useState(null);
  const [isAddNavbarOpen, setIsAddNavbarOpen] = useState(false);
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

  const handleAddNavbar = useCallback(() => setIsAddNavbarOpen(true), []);
  const handleCancelAddNavbar = useCallback(() => setIsAddNavbarOpen(false), []);

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
        onAddNavbar={handleAddNavbar}
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

      <Modal
        open={isAddNavbarOpen}
        onCancel={handleCancelAddNavbar}
        destroyOnClose
        footer={null}
        title={
          <div className="flex items-center gap-2 border-b border-gray-200 pb-4">
            <img
              src="/icons/headless/navbar.svg"
              alt="Navbars"
              className="w-6"
            />
            <span>Add Navbar</span>
          </div>
        }
        width={800}
      >
        {isAddNavbarOpen && (
          <AddNavbarForm
            media={media}
            onCancel={handleCancelAddNavbar}
            fetchNavbars={fetchNavbars}
          />
        )}
      </Modal>

      <NavbarsList
        navbars={paginatedNavbars}
        media={media}
        setNavbars={setNavbars}
        editingNavbarId={editingNavbarId}
        setEditingNavbarId={setEditingNavbarId}
        fetchNavbars={fetchNavbars}
        onCreate={handleAddNavbar}
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
