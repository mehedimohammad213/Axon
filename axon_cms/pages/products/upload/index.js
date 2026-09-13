import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Empty, Pagination, Spin, message } from "antd";
import { ShoppingOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import instance from "../../../axios";
import { useGlobalRefresh } from "../../../src/context/MenuRefreshContext";
import ProductsHeader from "../../../components/products/ProductsHeader";
import ProductsList from "../../../components/products/ProductsList";
import ProductFormDrawer from "../../../components/products/ProductFormDrawer";

const UploadProductsPage = () => {
  const router = useRouter();
  const typeIdFromQuery = router.query.typeId || null;

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [defaultTypeId, setDefaultTypeId] = useState(null);

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
    setLoading(true);
    try {
      const response = await instance.get("/products", {
        params: { limit: 100 },
      });
      if (response.status === 200 && Array.isArray(response.data)) {
        setProducts(response.data);
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
    if (!term) return products;
    return products.filter((product) => {
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
  }, [products, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handleDeleteProduct = async (id) => {
    try {
      await instance.delete(`/products/${id}`);
      message.success("Product deleted successfully.");
      fetchProducts();
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Failed to delete product."
      );
    }
  };

  const openUploadProduct = () => {
    if (!productTypes.length) {
      message.info("Create a product type form first.");
      router.push("/products/create-type");
      return;
    }
    setEditingProduct(null);
    setDefaultTypeId(typeIdFromQuery || productTypes[0]?.id || null);
    setIsProductFormOpen(true);
  };

  return (
    <div className="headlesscontainer rounded-xl bg-gray-50/80 px-4 pt-4 pb-10 sm:px-6 sm:pt-6 sm:pb-12">
      <div className="space-y-4">
        <ProductsHeader
          title="Upload Product"
          countLabel={products.length === 1 ? "Product" : "Products"}
          itemCount={products.length}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onRefresh={refreshAll}
          searchPlaceholder="Search products..."
          primaryActionLabel="Upload Product"
          onPrimaryAction={openUploadProduct}
          apiEndpoint="/products"
        />

        {loading ? (
          <div className="mt-6 flex items-center justify-center py-20">
            <Spin size="large" />
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
            <ProductsList
              products={paginatedProducts}
              productTypes={productTypes}
              onEdit={(product) => {
                setEditingProduct(product);
                setDefaultTypeId(product.product_type_id);
                setIsProductFormOpen(true);
              }}
              onDelete={handleDeleteProduct}
            />
            {filteredProducts.length > itemsPerPage && (
              <div className="flex justify-center rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <Pagination
                  current={currentPage}
                  pageSize={itemsPerPage}
                  total={filteredProducts.length}
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
                    No products uploaded yet
                  </p>
                  <p className="text-sm text-gray-500">
                    {productTypes.length
                      ? "Click Upload Product to add your first item."
                      : "Create a product type first, then upload products."}
                  </p>
                </div>
              }
            >
              <button
                type="button"
                onClick={openUploadProduct}
                className="mt-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
              >
                {productTypes.length ? "Upload Product" : "Create Product Type"}
              </button>
            </Empty>
          </div>
        )}
      </div>

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
