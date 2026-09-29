import { useEffect } from "react";
import { useRouter } from "next/router";
import { Spin } from "antd";

const ProductsIndexPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/products/types");
  }, [router]);

  return (
    <div className="flex items-center justify-center py-24">
      <Spin size="large" />
    </div>
  );
};

export default ProductsIndexPage;
