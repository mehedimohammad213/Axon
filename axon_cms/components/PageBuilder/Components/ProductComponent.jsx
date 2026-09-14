import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Drawer,
  Card,
  Space,
  Collapse,
  Switch,
  Tag,
  Image,
  Typography,
  message,
} from "antd";
import RichTextEditor from "../../RichTextEditor";
import {
  EyeOutlined,
  CheckOutlined,
  GlobalOutlined,
  EditOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import ComponentEditButton from "./components/ComponentEditButton";
import BaseComponent from "./BaseComponent";
import instance from "../../../axios";
import { getFieldDisplayValue, getListFields } from "../../products/productUtils";
import { resolveMediaUrl } from "../../../utils/mediaUrl";

const { Panel } = Collapse;
const { Text } = Typography;

const getThumbnail = (product) => {
  const filePath =
    product?.media_files?.file_path ||
    (Array.isArray(product?.media) && product.media[0]?.file_path);
  return filePath ? resolveMediaUrl(filePath) : null;
};

const ProductDisplay = ({ productData, preview = false }) => {
  if (!productData?.productId && !productData?.id) {
    return <Text type="secondary">No product selected.</Text>;
  }

  const thumbnail = getThumbnail(productData);
  const typeName =
    productData.product_type?.name || productData.productType?.name || null;
  const listFields = getListFields(
    productData.product_type || productData.productType
  ).slice(0, 6);
  const title =
    productData.showAltContent && productData.altTitle
      ? productData.altTitle
      : productData.title || "Untitled product";
  const description =
    productData.showAltContent && productData.altDescription
      ? productData.altDescription
      : productData.description || "";

  return (
    <div
      className={`rounded-lg border border-gray-100 bg-white p-4 ${
        preview ? "" : ""
      }`}
    >
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
          {description &&
            (productData.showAltContent && productData.altDescription ? (
              <div
                className="text-sm text-gray-600"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            ) : (
              <Text type="secondary" className="text-sm">
                {description}
              </Text>
            ))}
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
  const [showAltContent, setShowAltContent] = useState(false);
  const [showAltInputs, setShowAltInputs] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (isDrawerVisible) {
      fetchAvailableProducts();
    }
  }, [isDrawerVisible]);

  useEffect(() => {
    if (component?.data) {
      setShowAltContent(component.data?.showAltContent || false);
    }
  }, [component?.data]);

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
        altTitle: component.data?.altTitle || "",
        altDescription: component.data?.altDescription || "",
        showAltContent: component.data?.showAltContent || false,
      },
    });
    setIsDrawerVisible(false);
    setIsPreviewing(false);
    setSelectedProduct(null);
    message.success("Product selected successfully.");
  };

  const renderProductPreview = () => {
    if (!selectedProduct) return null;
    return <ProductDisplay productData={selectedProduct} preview />;
  };

  const renderContent = () => {
    if (preview || component.data?.productId) {
      return <ProductDisplay productData={component.data} preview={preview} />;
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
          renderProductPreview()
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
              availableProducts.map((product) => {
                const thumbnail = getThumbnail(product);
                const typeName =
                  product.product_type?.name ||
                  product.productType?.name ||
                  null;

                return (
                  <Card
                    key={product.id}
                    className="hover:shadow-md transition-shadow"
                    actions={[
                      <Button
                        key="preview"
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => handleProductSelect(product)}
                      >
                        Preview
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

      {component?.data?.productId && !preview && (
        <Collapse className="mt-4">
          <Panel
            header={
              <div className="flex items-center gap-2">
                <GlobalOutlined />
                Multi-Language Settings
              </div>
            }
            key="multilang"
          >
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-md font-semibold">
                    Display Alternative Content
                  </h4>
                  <p className="text-sm text-gray-600">
                    Toggle to show alternative title and description for product
                  </p>
                </div>
                <Switch
                  checked={showAltContent}
                  onChange={(checked) => {
                    setShowAltContent(checked);
                    updateComponent({
                      ...component,
                      data: {
                        ...component.data,
                        showAltContent: checked,
                      },
                    });
                  }}
                />
              </div>

              {showAltContent && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-800">
                    <strong>Alternative Content Mode:</strong> Product will
                    display alternative title and description when available.
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 bg-white rounded-lg border">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-lg font-semibold flex items-center gap-2">
                    <EditOutlined />
                    Alternative Content
                  </h5>
                  <ComponentEditButton
                    onClick={() => setShowAltInputs(true)}
                    title="Edit alternative content"
                  />
                </div>

                {showAltInputs ? (
                  <Form layout="vertical" className="w-full">
                    <Form.Item label="Alternative Title" className="mb-3">
                      <Input
                        placeholder="Enter alternative title"
                        defaultValue={component.data?.altTitle || ""}
                        onChange={(e) => {
                          updateComponent({
                            ...component,
                            data: {
                              ...component.data,
                              altTitle: e.target.value,
                            },
                          });
                        }}
                      />
                    </Form.Item>

                    <Form.Item label="Alternative Description" className="mb-4">
                      <RichTextEditor
                        defaultValue={component.data?.altDescription || ""}
                        onChange={(html) => {
                          updateComponent({
                            ...component,
                            data: {
                              ...component.data,
                              altDescription: html,
                            },
                          });
                        }}
                        editMode={true}
                        maxLength={2000}
                      />
                    </Form.Item>

                    <div className="mt-4 flex justify-end">
                      <Button
                        type="primary"
                        icon={<CheckOutlined />}
                        onClick={() => {
                          setShowAltInputs(false);
                          message.success(
                            "Alternative content updated successfully."
                          );
                        }}
                        className="headlessbutton"
                      >
                        Update Alternative Content
                      </Button>
                    </div>
                  </Form>
                ) : (
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <div className="text-sm">
                      <div>
                        <strong>Alt Title:</strong>{" "}
                        {component.data?.altTitle || "Not set"}
                      </div>
                      <div>
                        <strong>Alt Description:</strong>{" "}
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              component.data?.altDescription || "Not set",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Panel>
        </Collapse>
      )}
    </>
  );
};

export default ProductComponent;
