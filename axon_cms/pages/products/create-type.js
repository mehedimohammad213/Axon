import { HomeOutlined } from "@ant-design/icons";
import { Breadcrumb } from "antd";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ProductTypeBuilder from "../../components/products/builder/ProductTypeBuilder";

export default function CreateProductType() {
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
              title: "Create Product Type",
            },
        ]}
      />
      <DndProvider backend={HTML5Backend}>
        <ProductTypeBuilder />
      </DndProvider>
    </div>
  );
}
