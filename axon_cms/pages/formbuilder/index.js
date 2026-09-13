// pages/formbuilder/index.js
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pagination, Spin, message } from "antd";
import { useRouter } from "next/router";
import { FormBuilderProvider } from "../../src/context/FormBuilderContext";
import FormBuilderHeader from "../../components/formbuilder/FormBuilderHeader";
import HeadlessFormsList from "../../components/formbuilder/HeadlessFormsList";
import { setPageTitle } from "../../global/constants/pageTitle";
import instance from "../../axios";
import { useGlobalRefresh } from "../../src/context/MenuRefreshContext";

export default function FormBuilder() {
  const router = useRouter();
  const [allForms, setAllForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("desc");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setPageTitle("Form Builder");
  }, []);

  const fetchForms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await instance.get("/form_builder");
      if (response.status === 200) {
        setAllForms(response.data ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  useGlobalRefresh(fetchForms);

  const filteredForms = useMemo(() => {
    if (!searchTerm.trim()) return allForms;
    const query = searchTerm.toLowerCase();
    return allForms.filter(
      (form) =>
        form.title?.toLowerCase().includes(query) ||
        form.description?.toLowerCase().includes(query)
    );
  }, [allForms, searchTerm]);

  const sortedForms = useMemo(() => {
    return [...filteredForms].sort((a, b) =>
      sortType === "asc" ? a.id - b.id : b.id - a.id
    );
  }, [filteredForms, sortType]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortType, itemsPerPage]);

  const paginatedForms = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedForms.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedForms, currentPage, itemsPerPage]);

  const handleShowChange = useCallback((value) => {
    setItemsPerPage(parseInt(value, 10));
  }, []);

  const handleDeleteForm = useCallback(async (formId) => {
    await instance.delete(`/form_builder/${formId}`);
    setAllForms((prev) => prev.filter((form) => form.id !== formId));
    message.success("Form deleted successfully");
  }, []);

  const handleCreate = useCallback(() => {
    router.push("/formbuilder/create-form");
  }, [router]);

  if (loading) {
    return (
      <div className="headlesscontainer flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <FormBuilderProvider>
      <div className="headlesscontainer rounded-xl bg-gray-50/80 px-4 pt-4 pb-10 sm:px-6 sm:pt-6 sm:pb-12">
        <FormBuilderHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortType={sortType}
          setSortType={setSortType}
          onShowChange={handleShowChange}
          onRefresh={fetchForms}
          itemCount={allForms.length}
        />

        <HeadlessFormsList
          forms={paginatedForms}
          onDeleteForm={handleDeleteForm}
          onCreate={handleCreate}
        />

        {sortedForms.length > itemsPerPage && (
          <div className="mt-4 flex justify-center">
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <Pagination
                current={currentPage}
                pageSize={itemsPerPage}
                total={sortedForms.length}
                onChange={setCurrentPage}
                showSizeChanger={false}
                className="[&_.ant-pagination-item-active]:border-brand [&_.ant-pagination-item-active_a]:text-brand-dark"
              />
            </div>
          </div>
        )}
      </div>
    </FormBuilderProvider>
  );
}
