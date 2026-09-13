import { useEffect, useState } from "react";
import { HomeOutlined } from "@ant-design/icons";
import { Breadcrumb, Spin, message } from "antd";
import { useRouter } from "next/router";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import instance from "../../axios";
import ProductTypeBuilder from "../../components/products/builder/ProductTypeBuilder";

export default function EditProductType() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [productType, setProductType] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchType = async () => {
      setLoading(true);
      try {
        const response = await instance.get(`/product-types/${id}`);
        setProductType(response.data);
      } catch (error) {
        message.error("Failed to load product type.");
        router.push("/products/types");
      } finally {
        setLoading(false);
      }
    };

    fetchType();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-6">
      <Breadcrumb
        className="mb-4"
        items={[
          {
            title: <HomeOutlined />,
            href: "/",
          },
            {
              title: "Products",
              href: "/products/types",
            },
            {
              title: "Edit Product Type",
            },
        ]}
      />
      <DndProvider backend={HTML5Backend}>
        <ProductTypeBuilder editingType={productType} />
      </DndProvider>
    </div>
  );
}
