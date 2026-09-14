// pages/form-responses/index.jsx

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pagination, Spin } from "antd";
import { setPageTitle } from "../../../global/constants/pageTitle";
import FormResponsesHeader from "../../../components/FormResponses/FormResponsesHeader";
import FormResponsesTable from "../../../components/FormResponses/FormResponsesTable";
import FormResponsesGrid from "../../../components/FormResponses/FormResponsesGrid";
import { getResponseDisplayName } from "../../../components/FormResponses/getResponseDisplayName";
import instance from "../../../axios";

const FormResponsesIndexPage = () => {
  const [allResponses, setAllResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("desc");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ form_type: undefined });

  useEffect(() => {
    setPageTitle("Form Responses");
  }, []);

  const fetchResponses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await instance.get(`/form-submission`);
      if (response.status === 200) {
        const sanitizedData = response.data.map((item) => ({
          ...item,
          form_data:
            item.form_data && typeof item.form_data === "object"
              ? item.form_data
              : {},
        }));
        setAllResponses(sanitizedData);
      } else {
        setError("Failed to fetch form responses.");
      }
    } catch (err) {
      console.error("Error fetching form responses:", err);
      setError("An error occurred while fetching form responses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResponses();
  }, [fetchResponses]);

  const formTypes = useMemo(() => {
    const types = new Set(
      allResponses.map((item) => item.form_type).filter(Boolean)
    );
    return Array.from(types);
  }, [allResponses]);

  const filteredResponses = useMemo(() => {
    let results = [...allResponses];

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      results = results.filter((item) => {
        const name = getResponseDisplayName(item.form_data).toLowerCase();
        const email = item.form_data?.email?.toLowerCase() || "";
        const type = item.form_type?.toLowerCase() || "";
        return (
          name.includes(query) ||
          email.includes(query) ||
          type.includes(query) ||
          String(item.id).includes(query)
        );
      });
    }

    if (filters.form_type) {
      results = results.filter((item) => item.form_type === filters.form_type);
    }

    return results;
  }, [allResponses, searchTerm, filters]);

  const sortedResponses = useMemo(() => {
    return [...filteredResponses].sort((a, b) =>
      sortType === "asc" ? a.id - b.id : b.id - a.id
    );
  }, [filteredResponses, sortType]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters, sortType, itemsPerPage]);

  const paginatedResponses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedResponses.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedResponses, currentPage, itemsPerPage]);

  const handleShowChange = useCallback((value) => {
    setItemsPerPage(parseInt(value, 10));
  }, []);

  const applyFilters = useCallback((filterValues) => {
    setFilters(filterValues);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ form_type: undefined });
  }, []);

  if (loading) {
    return (
      <div className="headlesscontainer flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="headlesscontainer px-4 py-6">
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <div className="headlesscontainer rounded-xl bg-gray-50/80 px-4 pt-4 pb-10 sm:px-6 sm:pt-6 sm:pb-12">
      <FormResponsesHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortType={sortType}
        setSortType={setSortType}
        onShowChange={handleShowChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filterOptions={{ formTypes }}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
        onRefresh={fetchResponses}
        itemCount={allResponses.length}
      />

      <div className="mt-6">
        {viewMode === "table" ? (
          <FormResponsesTable
            responses={paginatedResponses}
            refreshData={fetchResponses}
          />
        ) : (
          <FormResponsesGrid
            responses={paginatedResponses}
            refreshData={fetchResponses}
          />
        )}
      </div>

      {sortedResponses.length > itemsPerPage && (
        <div className="mt-4 flex justify-center">
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <Pagination
              current={currentPage}
              pageSize={itemsPerPage}
              total={sortedResponses.length}
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

export default FormResponsesIndexPage;
