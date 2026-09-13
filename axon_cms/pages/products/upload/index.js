import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pagination, Spin, message } from "antd";
import { useRouter } from "next/router";
import instance from "../../../axios";
import { setPageTitle } from "../../../global/constants/pageTitle";
import { useGlobalRefresh } from "../../../src/context/MenuRefreshContext";
import ProductsHeader from "../../../components/products/ProductsHeader";
import ProductsList from "../../../components/products/ProductsList";
import ProductFormDrawer from "../../../components/products/ProductFormDrawer";
import ProductViewDrawer from "../../../components/products/ProductViewDrawer";

const UploadProductsPage = () => {
  const router = useRouter();
  const typeIdFromQuery = router.query.typeId || null;

  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [defaultTypeId, setDefaultTypeId] = useState(null);

  useEffect(() => {
    setPageTitle("Upload Product");
  }, []);

  const fetchProductTypes = useCallback(async () => {
    try {
      const response = await instance.get("/product-types", {
        params: { limit: 100 },
      });
      if (response.status === 200 && Array.isArray(response.data)) {
        setProductTypes(response.data);
      }
    } catch (error) {
      console.error("Error fetching product types:", error);
      message.error("Failed to fetch product types.");
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await instance.get("/products", {
        params: { limit: 100 },
      });
      if (response.status === 200 && Array.isArray(response.data)) {
        setAllProducts(response.data);
      } else {
        message.error("Failed to fetch products.");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      message.error("Failed to fetch products.");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchProductTypes(), fetchProducts()]);
  }, [fetchProductTypes, fetchProducts]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useGlobalRefresh(refreshAll);

  useEffect(() => {
    if (!router.isReady) return;
    if (typeIdFromQuery) {
      setDefaultTypeId(typeIdFromQuery);
      setEditingProduct(null);
      setIsProductFormOpen(true);
    }
  }, [router.isReady, typeIdFromQuery]);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return allProducts;
    return allProducts.filter((product) => {
      const haystack = [
        product.title,
        product.slug,
        product.description,
        product.product_type?.name,
        String(product.id),
        ...Object.values(product.field_values || {}),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [allProducts, searchTerm]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) =>
      sortType === "asc" ? a.id - b.id : b.id - a.id
    );
  }, [filteredProducts, sortType]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortType, itemsPerPage]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(start, start + itemsPerPage);
  }, [sortedProducts, currentPage, itemsPerPage]);

  const handleShowChange = useCallback((value) => {
    setItemsPerPage(parseInt(value, 10));
  }, []);

  const handleDeleteProduct = useCallback(async (id) => {
    try {
      await instance.delete(`/products/${id}`);
      message.success("Product deleted successfully.");
      setAllProducts((prev) => prev.filter((product) => product.id !== id));
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Failed to delete product."
      );
    }
  }, []);

  const openUploadProduct = useCallback(() => {
    if (!productTypes.length) {
      message.info("Create a product type form first.");
      router.push("/products/create-type");
      return;
    }
    setEditingProduct(null);
    setDefaultTypeId(typeIdFromQuery || productTypes[0]?.id || null);
    setIsProductFormOpen(true);
  }, [productTypes, router, typeIdFromQuery]);

  if (loading) {
    return (
      <div className="headlesscontainer flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="headlesscontainer rounded-xl bg-gray-50/80 px-4 pt-4 pb-10 sm:px-6 sm:pt-6 sm:pb-12">
      <ProductsHeader
        title="Upload Product"
        countLabel={allProducts.length === 1 ? "Product" : "Products"}
        itemCount={allProducts.length}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortType={sortType}
        setSortType={setSortType}
        onShowChange={handleShowChange}
        onRefresh={refreshAll}
        searchPlaceholder="Search products..."
        primaryActionLabel="Upload Product"
        onPrimaryAction={openUploadProduct}
        apiEndpoint="/products"
      />

      <ProductsList
        products={paginatedProducts}
        productTypes={productTypes}
        onView={setViewingProduct}
        onEdit={(product) => {
          setEditingProduct(product);
          setDefaultTypeId(product.product_type_id);
          setIsProductFormOpen(true);
        }}
        onDelete={handleDeleteProduct}
        onCreate={openUploadProduct}
        emptyTitle="No products uploaded yet"
        emptyDescription={
          productTypes.length
            ? "Click Upload Product to add your first item."
            : "Create a product type first, then upload products."
        }
        createLabel={
          productTypes.length ? "Upload Product" : "Create Product Type"
        }
      />

      {sortedProducts.length > itemsPerPage && (
        <div className="mt-4 flex justify-center">
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <Pagination
              current={currentPage}
              pageSize={itemsPerPage}
              total={sortedProducts.length}
              onChange={setCurrentPage}
              showSizeChanger={false}
              className="[&_.ant-pagination-item-active]:border-brand [&_.ant-pagination-item-active_a]:text-brand-dark"
            />
          </div>
        </div>
      )}

      <ProductViewDrawer
        open={Boolean(viewingProduct)}
        product={viewingProduct}
        productType={
          viewingProduct?.product_type ||
          productTypes.find(
            (type) =>
              String(type.id) === String(viewingProduct?.product_type_id)
          )
        }
        onClose={() => setViewingProduct(null)}
        onEdit={(product) => {
          setEditingProduct(product);
          setDefaultTypeId(product.product_type_id);
          setIsProductFormOpen(true);
        }}
      />

      <ProductFormDrawer
        open={isProductFormOpen}
        productTypes={productTypes}
        editingProduct={editingProduct}
        defaultTypeId={defaultTypeId}
        onClose={() => {
          setIsProductFormOpen(false);
          setEditingProduct(null);
          if (typeIdFromQuery) {
            router.replace("/products/upload", undefined, { shallow: true });
          }
        }}
        onSuccess={fetchProducts}
      />
    </div>
  );
};

export default UploadProductsPage;
