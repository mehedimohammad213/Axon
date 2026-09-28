import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pagination, Spin, message } from "antd";
import { useRouter } from "next/router";
import instance from "../../../axios";
import { setPageTitle } from "../../../global/constants/pageTitle";
import { useGlobalRefresh } from "../../../src/context/MenuRefreshContext";
import ProductsHeader from "../../../components/products/ProductsHeader";
import ProductTypesList from "../../../components/products/ProductTypesList";
import { parseFieldSchema } from "../../../components/products/productUtils";

const ProductTypesPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [productTypes, setProductTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState({ status: undefined });

  useEffect(() => {
    setPageTitle("Product Types");
  }, []);

  const fetchProductTypes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await instance.get("/product-types", {
        params: { limit: 100 },
      });
      if (response.status === 200 && Array.isArray(response.data)) {
        setProductTypes(response.data);
      } else {
        message.error("Failed to fetch product types.");
      }
    } catch (error) {
      console.error("Error fetching product types:", error);
      message.error("Failed to fetch product types.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProductTypes();
  }, [fetchProductTypes]);

  useGlobalRefresh(fetchProductTypes);

  const filteredTypes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let results = [...productTypes];

    if (term) {
      results = results.filter((type) => {
        const fieldLabels = parseFieldSchema(type.field_schema)
          .map((field) => field.label)
          .join(" ");
        return [type.name, type.slug, type.description, String(type.id), fieldLabels]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term);
      });
    }

    if (filters.status === "active") {
      results = results.filter(
        (type) => type.status !== false && type.status !== 0
      );
    } else if (filters.status === "inactive") {
      results = results.filter(
        (type) => type.status === false || type.status === 0
      );
    }

    return results;
  }, [productTypes, searchTerm, filters]);

  const sortedTypes = useMemo(() => {
    return [...filteredTypes].sort((a, b) =>
      sortType === "asc" ? a.id - b.id : b.id - a.id
    );
  }, [filteredTypes, sortType]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters, sortType, itemsPerPage]);

  const paginatedTypes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedTypes.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedTypes, currentPage, itemsPerPage]);

  const handleCreate = useCallback(() => {
    router.push("/products/create-type");
  }, [router]);

  const handleShowChange = useCallback((value) => {
    setItemsPerPage(parseInt(value, 10));
  }, []);

  const applyFilters = useCallback((filterValues) => {
    setFilters(filterValues);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ status: undefined });
  }, []);

  const handleDeleteType = useCallback(
    async (id) => {
      try {
        await instance.delete(`/product-types/${id}`);
        message.success("Product type deleted successfully.");
        fetchProductTypes();
      } catch (error) {
        message.error(
          error?.response?.data?.message || "Failed to delete product type."
        );
      }
    },
    [fetchProductTypes]
  );

  if (loading) {
    return (
      <div className="headlesscontainer flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="headlesscontainer rounded-xl bg-surface px-4 pt-4 pb-10 sm:px-6 sm:pt-6 sm:pb-12">
      <ProductsHeader
        title="Product Types"
        countLabel={productTypes.length === 1 ? "Type" : "Types"}
        itemCount={productTypes.length}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortType={sortType}
        setSortType={setSortType}
        onShowChange={handleShowChange}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
        filterTitle="Filter product types"
        onRefresh={fetchProductTypes}
        searchPlaceholder="Search product types..."
        primaryActionLabel="Create Product Type"
        onPrimaryAction={handleCreate}
        apiEndpoint="/product-types"
      />

      <ProductTypesList
        productTypes={paginatedTypes}
        onUploadProduct={(type) =>
          router.push(`/products/upload?typeId=${type.id}`)
        }
        onDelete={handleDeleteType}
        onCreate={handleCreate}
      />

      {sortedTypes.length > itemsPerPage && (
        <div className="mt-4 flex justify-center">
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <Pagination
              current={currentPage}
              pageSize={itemsPerPage}
              total={sortedTypes.length}
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

export default ProductTypesPage;
