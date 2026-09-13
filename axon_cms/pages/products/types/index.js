import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Empty, Pagination, Spin, message } from "antd";
import { ShoppingOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import instance from "../../../axios";
import { useGlobalRefresh } from "../../../src/context/MenuRefreshContext";
import ProductsHeader from "../../../components/products/ProductsHeader";
import ProductTypeRow from "../../../components/products/ProductTypeRow";
import { parseFieldSchema } from "../../../components/products/productUtils";

const ProductTypesPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [productTypes, setProductTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedTypeId, setExpandedTypeId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
    if (!term) return productTypes;
    return productTypes.filter((type) => {
      const fieldLabels = parseFieldSchema(type.field_schema)
        .map((field) => field.label)
        .join(" ");
      return [type.name, type.slug, type.description, String(type.id), fieldLabels]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [productTypes, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  const paginatedTypes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTypes.slice(start, start + itemsPerPage);
  }, [filteredTypes, currentPage, itemsPerPage]);

  const handleDeleteType = async (id) => {
    try {
      await instance.delete(`/product-types/${id}`);
      message.success("Product type deleted successfully.");
      if (expandedTypeId === id) setExpandedTypeId(null);
      fetchProductTypes();
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Failed to delete product type."
      );
    }
  };

  return (
    <div className="headlesscontainer rounded-xl bg-gray-50/80 px-4 pt-4 pb-10 sm:px-6 sm:pt-6 sm:pb-12">
      <div className="space-y-4">
        <ProductsHeader
          title="Product Type"
          countLabel={
            productTypes.length === 1 ? "Product Type" : "Product Types"
          }
          itemCount={productTypes.length}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onRefresh={fetchProductTypes}
          searchPlaceholder="Search product types..."
          primaryActionLabel="Create Product Type"
          onPrimaryAction={() => router.push("/products/create-type")}
          apiEndpoint="/product-types"
        />

        {loading ? (
          <div className="mt-6 flex items-center justify-center py-20">
            <Spin size="large" />
          </div>
        ) : filteredTypes.length > 0 ? (
          <>
            <div className="mt-2 space-y-4">
              <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
                {paginatedTypes.map((type) => (
                  <ProductTypeRow
                    key={type.id}
                    productType={type}
                    expandedTypeId={expandedTypeId}
                    handleExpand={(id) =>
                      setExpandedTypeId((prev) => (prev === id ? null : id))
                    }
                    onUploadProduct={(type) =>
                      router.push(`/products/upload?typeId=${type.id}`)
                    }
                    onDelete={handleDeleteType}
                  />
                ))}
              </div>
            </div>
            {filteredTypes.length > itemsPerPage && (
              <div className="flex justify-center rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <Pagination
                  current={currentPage}
                  pageSize={itemsPerPage}
                  total={filteredTypes.length}
                  onChange={setCurrentPage}
                  showSizeChanger
                  onShowSizeChange={(_, size) => setItemsPerPage(size)}
                />
              </div>
            )}
          </>
        ) : (
          <div className="mt-6 flex items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16">
            <Empty
              image={
                <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-2xl text-brand-dark">
                  <ShoppingOutlined />
                </div>
              }
              description={
                <div className="space-y-1">
                  <p className="text-base font-medium text-gray-800">
                    No product types yet
                  </p>
                  <p className="text-sm text-gray-500">
                    Create a product form with drag-and-drop fields, then upload
                    products.
                  </p>
                </div>
              }
            >
              <button
                type="button"
                onClick={() => router.push("/products/create-type")}
                className="mt-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
              >
                Create Product Type
              </button>
            </Empty>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTypesPage;
