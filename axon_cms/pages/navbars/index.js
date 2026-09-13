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
  const [menus, setMenus] = useState([]);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingNavbarId, setEditingNavbarId] = useState(null);
  const [expandedNavbarId, setExpandedNavbarId] = useState(null);
  const [isAddNavbarOpen, setIsAddNavbarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("desc");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ menu_id: undefined });

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

  const fetchMenus = useCallback(async () => {
    try {
      const response = await instance("/menus");
      if (response.data) setMenus(response.data);
    } catch {
      message.error("Menus couldn't be fetched");
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
    await Promise.all([fetchNavbars(), fetchMenus(), fetchMedia()]);
  }, [fetchNavbars, fetchMenus, fetchMedia]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useGlobalRefresh(refreshAll);

  const filteredNavbars = useMemo(() => {
    let results = [...allNavbars];

    if (searchTerm.trim()) {
      results = results.filter((navbar) =>
        navbar.title_en.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.menu_id) {
      results = results.filter(
        (navbar) => navbar.menu?.id === filters.menu_id
      );
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

  const handleExpand = useCallback((navbarId) => {
    setExpandedNavbarId((prev) => (prev === navbarId ? null : navbarId));
  }, []);

  const handleAddNavbar = useCallback(() => setIsAddNavbarOpen(true), []);
  const handleCancelAddNavbar = useCallback(() => setIsAddNavbarOpen(false), []);

  const handleShowChange = useCallback((value) => {
    setItemsPerPage(parseInt(value, 10));
  }, []);

  const applyFilters = useCallback((filterValues) => {
    setFilters(filterValues);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ menu_id: undefined });
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
    <div className="headlesscontainer rounded-xl bg-gray-50/80 px-4 pt-4 pb-10 sm:px-6 sm:pt-6 sm:pb-12">
      <NavbarHeader
        onAddNavbar={handleAddNavbar}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortType={sortType}
        setSortType={setSortType}
        onShowChange={handleShowChange}
        filterOptions={{ menus }}
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
            menus={menus}
            fetchMenus={fetchMenus}
            media={media}
            onCancel={handleCancelAddNavbar}
            fetchNavbars={fetchNavbars}
          />
        )}
      </Modal>

      <NavbarsList
        navbars={paginatedNavbars}
        menus={menus}
        media={media}
        setNavbars={setNavbars}
        editingNavbarId={editingNavbarId}
        setEditingNavbarId={setEditingNavbarId}
        fetchNavbars={fetchNavbars}
        expandedNavbarId={expandedNavbarId}
        handleExpand={handleExpand}
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
