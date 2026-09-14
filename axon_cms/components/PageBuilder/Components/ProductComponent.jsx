import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Drawer,
  Card,
  Space,
  Tag,
  Image,
  Typography,
  message,
} from "antd";
import { EyeOutlined, ShoppingOutlined } from "@ant-design/icons";
import BaseComponent from "./BaseComponent";
import instance from "../../../axios";
import { getFieldDisplayValue, getListFields } from "../../products/productUtils";
import { resolveMediaUrl } from "../../../utils/mediaUrl";

const { Text } = Typography;

const getThumbnail = (product) => {
  const filePath =
    product?.media_files?.file_path ||
    (Array.isArray(product?.media) && product.media[0]?.file_path);
  return filePath ? resolveMediaUrl(filePath) : null;
};

const ProductDisplay = ({ productData }) => {
  if (!productData?.productId && !productData?.id) {
    return <Text type="secondary">No product selected.</Text>;
  }

  const thumbnail = getThumbnail(productData);
  const typeName =
    productData.product_type?.name || productData.productType?.name || null;
  const listFields = getListFields(
    productData.product_type || productData.productType
  ).slice(0, 6);
  const title = productData.title || "Untitled product";
  const description = productData.description || "";

  return (
    <div className="rounded-lg border border-gray-100 bg-white p-4">
      <div className="flex gap-4">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={title}
              width={96}
              height={96}
              className="h-24 w-24 object-cover"
              preview={false}
            />
          ) : (
            <ShoppingOutlined className="text-2xl text-gray-400" />
          )}
        </div>
        <div className="min-w-0 flex-1 flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Text strong className="text-lg">
              {title}
            </Text>
            {typeName && <Tag color="blue">{typeName}</Tag>}
          </div>
          {description && (
            <Text type="secondary" className="text-sm">
              {description}
            </Text>
          )}
          {listFields.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {listFields.map((field) => (
                <Text
                  key={field.name || field.id}
                  type="secondary"
                  className="text-xs"
                >
                  <span className="font-medium text-gray-600">
                    {field.label || field.name}:
                  </span>{" "}
                  {getFieldDisplayValue(productData, field.name)}
                </Text>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductComponent = ({
  component,
  updateComponent,
  deleteComponent,
  preview = false,
  onDuplicateElement,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (isDrawerVisible) {
      fetchAvailableProducts();
    }
  }, [isDrawerVisible]);

  const fetchAvailableProducts = async () => {
    try {
      const response = await instance.get("/products", {
        params: { limit: 100 },
      });
      setAvailableProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching products:", error);
      message.error("Failed to fetch products");
    }
  };

  const handleEdit = () => {
    setIsDrawerVisible(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.resetFields();
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      updateComponent({
        ...component,
        _headless: true,
        data: {
          ...component.data,
          ...values,
          productId: selectedProduct?.id || component.data?.productId,
        },
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Product validation failed:", error);
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setIsPreviewing(true);
  };

  const handleConfirmProduct = () => {
    if (!selectedProduct) {
      message.error("Please select a product first.");
      return;
    }

    updateComponent({
      ...component,
      _headless: true,
      data: {
        productId: selectedProduct.id,
        id: selectedProduct.id,
        title: selectedProduct.title,
        description: selectedProduct.description,
        slug: selectedProduct.slug,
        status: selectedProduct.status,
        field_values: selectedProduct.field_values,
        media_files: selectedProduct.media_files,
        media: selectedProduct.media,
        product_type: selectedProduct.product_type,
        product_type_id: selectedProduct.product_type_id,
        additional: selectedProduct.additional,
      },
    });
    setIsDrawerVisible(false);
    setIsPreviewing(false);
    setSelectedProduct(null);
    message.success("Product selected successfully.");
  };

  const currentProductId = component.data?.productId ?? component.data?.id;

  const sortedProducts = [...availableProducts].sort((a, b) => {
    const aSelected = String(a.id) === String(currentProductId);
    const bSelected = String(b.id) === String(currentProductId);
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return 0;
  });

  const renderContent = () => {
    if (preview || component.data?.productId) {
      return <ProductDisplay productData={component.data} />;
    }

    return (
      <div className="flex justify-center items-center p-8">
        <Button
          className="headlessbutton"
          type="primary"
          onClick={() => setIsDrawerVisible(true)}
          size="large"
        >
          Choose Product
        </Button>
      </div>
    );
  };

  return (
    <>
      <BaseComponent
        component={{
          ...component,
          _headless: component.data?.productId ? true : false,
        }}
        updateComponent={updateComponent}
        deleteComponent={deleteComponent}
        preview={preview}
        onDuplicateElement={onDuplicateElement}
        title="Product"
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        onEdit={handleEdit}
        onCancel={handleCancel}
        onSave={handleSave}
      >
        {renderContent()}
      </BaseComponent>

      <Drawer
        title="Select Product"
        placement="right"
        width={720}
        open={isDrawerVisible}
        onClose={() => {
          setIsDrawerVisible(false);
          setIsPreviewing(false);
          setSelectedProduct(null);
        }}
        extra={
          isPreviewing && (
            <Space>
              <Button onClick={() => setIsPreviewing(false)}>Back</Button>
              <Button type="primary" onClick={handleConfirmProduct}>
                Confirm
              </Button>
            </Space>
          )
        }
      >
        {isPreviewing ? (
          selectedProduct ? <ProductDisplay productData={selectedProduct} /> : null
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {availableProducts.length === 0 ? (
              <div className="text-center py-8">
                <Text type="secondary">No products found.</Text>
                <div className="mt-4">
                  <Button
                    type="primary"
                    href="/products/upload"
                    target="_blank"
                    className="headlessbutton"
                  >
                    Upload Product
                  </Button>
                </div>
              </div>
            ) : (
              sortedProducts.map((product) => {
                const thumbnail = getThumbnail(product);
                const typeName =
                  product.product_type?.name ||
                  product.productType?.name ||
                  null;
                const isCurrent =
                  currentProductId != null &&
                  String(product.id) === String(currentProductId);

                return (
                  <Card
                    key={product.id}
                    className={`hover:shadow-md transition-shadow ${
                      isCurrent
                        ? "border-blue-400 bg-blue-50 ring-1 ring-blue-200"
                        : ""
                    }`}
                    actions={[
                      <Button
                        key="preview"
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => handleProductSelect(product)}
                      >
                        {isCurrent ? "Preview current" : "Preview"}
                      </Button>,
                    ]}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                        {thumbnail ? (
                          <Image
                            src={thumbnail}
                            alt={product.title || "Product"}
                            width={56}
                            height={56}
                            className="h-14 w-14 object-cover"
                            preview={false}
                          />
                        ) : (
                          <ShoppingOutlined className="text-lg text-gray-400" />
                        )}
                      </div>
                      <Card.Meta
                        title={
                          <div className="flex items-center gap-2 flex-wrap">
                            <span>{product.title || "Untitled product"}</span>
                            {isCurrent && <Tag color="green">Current</Tag>}
                            {typeName && <Tag color="blue">{typeName}</Tag>}
                          </div>
                        }
                        description={
                          product.description ||
                          product.slug ||
                          "No description"
                        }
                      />
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </Drawer>
    </>
  );
};

export default ProductComponent;
