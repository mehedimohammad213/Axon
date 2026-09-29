import React, { useEffect, useState } from "react";
import { Tabs, Card, Button, Popconfirm, Switch, message } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import instance from "../../../axios";
import ProductBuilderCanvas from "./ProductBuilderCanvas";
import ProductFieldPanel from "./ProductFieldPanel";
import {
  createFieldFromPalette,
  ensureFieldOptions,
  normalizeFieldsForBuilder,
  slugifyName,
  slugifySlug,
} from "../productUtils";

const { TabPane } = Tabs;

const ProductTypeBuilder = ({ editingType = null }) => {
  const router = useRouter();
  const [fields, setFields] = useState([]);
  const [typeMeta, setTypeMeta] = useState({
    name: "Demo",
    slug: "demo",
    description: "This is a demo product type.",
    status: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!editingType) return;
    setTypeMeta({
      name: editingType.name || "",
      slug: editingType.slug || "",
      description: editingType.description || "",
      status: editingType.status !== false,
    });
    setFields(normalizeFieldsForBuilder(editingType.field_schema));
  }, [editingType]);

  const addField = (element) => {
    setFields((prev) => [...prev, createFieldFromPalette(element, prev.length)]);
  };

  const updateFields = (nextFields) => {
    setFields(nextFields);
  };

  const saveType = async () => {
    const name = String(typeMeta.name || "").trim();
    if (!name) {
      message.error("Product type name is required. Check the Attributes tab.");
      return;
    }
    if (!fields.length) {
      message.error("Add at least one field to the product form.");
      return;
    }

    for (const field of fields) {
      if (!field.label?.trim()) {
        message.error("Every field needs a label. Open Show Config to edit.");
        return;
      }
    }

    const payload = {
      name,
      slug: slugifySlug(typeMeta.slug || name),
      description: typeMeta.description || null,
      status: typeMeta.status !== false,
      field_schema: fields.map((field, index) => ({
        id: field.id || `field_${index}`,
        name: slugifyName(field.name || field.label) || `field_${index + 1}`,
        label: field.label.trim(),
        field_type: field.field_type || "text",
        required: Boolean(field.required),
        placeholder: field.placeholder || "",
        show_in_list: field.show_in_list !== false,
        currency: field.currency || "BDT",
        min: field.min ?? 0,
        max: field.max ?? 100,
        step: field.step ?? 1,
        max_rating: field.max_rating ?? 5,
        division_label: field.division_label || "Select Division",
        district_label: field.district_label || "Select District",
        options: ["select", "radio", "multiselect"].includes(field.field_type)
          ? ensureFieldOptions(field)
          : [],
      })),
    };

    try {
      setLoading(true);
      if (editingType?.id) {
        await instance.put(`/product-types/${editingType.id}`, payload);
        message.success("Product type updated successfully.");
      } else {
        await instance.post("/product-types", payload);
        message.success("Product type created successfully.");
      }
      router.push("/products/types");
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Failed to save product type."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {editingType?.id ? "Edit Product" : "Create Product"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Build a product form by dragging fields, just like Form Builder.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/products/types")}
          aria-label="Back to product type list"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--danger-light)] text-[var(--danger)] transition-colors hover:text-[var(--danger-dark)]"
        >
          <CloseOutlined />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-4">
          <Tabs defaultActiveKey="1" type="card" size="large" centered>
            <TabPane tab="Builder" key="1">
              <ProductBuilderCanvas
                fields={fields}
                addField={addField}
                updateFields={updateFields}
              />
              <div className="flex justify-between mt-4">
                <div className="flex items-center gap-2">
                  <Button
                    className="headlessbutton headlessbutton-pill !mr-0"
                    onClick={saveType}
                    loading={loading}
                  >
                    Publish
                  </Button>
                </div>
                <Popconfirm
                  title="Are you sure you want to clear all fields?"
                  onConfirm={() => setFields([])}
                  okText="Yes"
                  cancelText="No"
                  okButtonProps={{ danger: true }}
                >
                  <Button danger className="headlesscancelbutton headlessbutton-pill !mr-0">
                    Clear Form
                  </Button>
                </Popconfirm>
              </div>
            </TabPane>

            <TabPane tab="Attributes" key="2">
              <Card className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Product Type Name
                </label>
                <input
                  className="border rounded w-full p-2 mb-4"
                  placeholder="e.g. Car, Phone, Course"
                  value={typeMeta.name || ""}
                  onChange={(e) => {
                    const name = e.target.value;
                    setTypeMeta((prev) => ({
                      ...prev,
                      name,
                      slug:
                        !editingType?.id || prev.slug === slugifySlug(prev.name)
                          ? slugifySlug(name)
                          : prev.slug,
                    }));
                  }}
                />

                <label className="block text-gray-700 font-bold mb-2">
                  Slug
                </label>
                <input
                  className="border rounded w-full p-2 mb-4"
                  placeholder="car"
                  value={typeMeta.slug || ""}
                  onChange={(e) =>
                    setTypeMeta((prev) => ({
                      ...prev,
                      slug: slugifySlug(e.target.value),
                    }))
                  }
                />

                <label className="block text-gray-700 font-bold mb-2">
                  Description
                </label>
                <textarea
                  className="border rounded w-full p-2 mb-4"
                  rows="4"
                  value={typeMeta.description || ""}
                  onChange={(e) =>
                    setTypeMeta((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />

                <label className="block text-gray-700 font-bold mb-2">
                  Status
                </label>
                <Switch
                  checked={typeMeta.status !== false}
                  onChange={(checked) =>
                    setTypeMeta((prev) => ({ ...prev, status: checked }))
                  }
                  checkedChildren="Active"
                  unCheckedChildren="Inactive"
                />
              </Card>
            </TabPane>
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          <ProductFieldPanel />
        </div>
      </div>
    </div>
  );
};

export default ProductTypeBuilder;
