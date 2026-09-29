import React, { useState } from "react";
import { Form, Input, Select, Radio, Button, message } from "antd";
import instance from "../../axios";

const { Option } = Select;

const AddMenuItemForm = ({
  pages = [],
  menuItems = [],
  onCancel,
  fetchMenuItems,
  onMenuItemCreated,
  formId = "add-menu-item-form",
  onLoadingChange,
  showSubmitButton = true,
}) => {
  const [form] = Form.useForm();
  const [linkType, setLinkType] = useState("independent");
  const [saving, setSaving] = useState(false);

  const generateSlug = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

  const buildParentPath = (parentId) => {
    const slugs = [];
    let currentId = parentId;
    while (currentId) {
      const parent = menuItems.find((item) => item.id === currentId);
      if (!parent) break;
      slugs.unshift(generateSlug(parent.title));
      currentId = parent.parent_id;
    }
    return slugs;
  };

  const handleAddMenuItem = async (values) => {
    const title = (values.title || "").trim();
    if (!title) {
      message.error("Please provide a valid Menu Item Title.");
      return;
    }

    const parentId = values.parent_id || null;
    const linkValue = values.link || "";
    let fullLink = "/";

    if (linkType === "page") {
      const selectedPage = pages.find((p) => p.slug === linkValue);
      const slugs = buildParentPath(parentId);
      slugs.push(generateSlug(title));
      const pageId = selectedPage ? selectedPage.id : "";
      const pageName = selectedPage
        ? generateSlug(selectedPage.page_name_en)
        : "";
      fullLink = `/${slugs.join("/")}${
        pageId ? `?pageId=${pageId}&pageName=${pageName}` : ""
      }`;
    } else {
      const slugs = buildParentPath(parentId);
      slugs.push(generateSlug(title));
      fullLink = linkValue?.trim() ? linkValue.trim() : `/${slugs.join("/")}`;
    }

    const payload = [
      {
        title: title || "N/A",
        title_bn: (values.title_bn || "").trim() || "N/A",
        parent_id: parentId,
        link: fullLink,
      },
    ];

    try {
      setSaving(true);
      onLoadingChange?.(true);
      const res = await instance.post("/menuitems", payload);
      if (res.status === 201) {
        const created = Array.isArray(res.data)
          ? res.data
          : res.data
            ? [res.data]
            : [];
        message.success("Menu item added successfully");
        await fetchMenuItems?.();
        onMenuItemCreated?.(created);
        form.resetFields();
        onCancel?.();
      } else {
        message.error("Error adding menu item");
      }
    } catch (error) {
      const apiMessage =
        error?.response?.data?.message ||
        (error?.response?.data?.errors &&
          Object.values(error.response.data.errors).flat().join(" "));
      message.error(apiMessage || "Error adding menu item");
    } finally {
      setSaving(false);
      onLoadingChange?.(false);
    }
  };

  return (
    <Form
      id={formId}
      form={form}
      layout="vertical"
      onFinish={handleAddMenuItem}
      initialValues={{ link_type: "independent" }}
    >
      <div
        style={{
          border: "1px solid #e8eef5",
          borderRadius: 12,
          padding: 16,
          background: "#ffffff",
        }}
      >
        <div className="grid gap-x-4 md:grid-cols-2">
          <Form.Item
            label="Item Name"
            name="title"
            rules={[{ required: true, message: "Please enter item name" }]}
          >
            <Input placeholder="Menu Item Title" disabled={saving} />
          </Form.Item>
          <Form.Item label="আইটেম নাম" name="title_bn">
            <Input placeholder="মেনু আইটেম শিরোনাম" disabled={saving} />
          </Form.Item>
          <Form.Item label="Parent Menu" name="parent_id">
            <Select
              showSearch
              placeholder="Select a Parent Menu"
              optionFilterProp="children"
              allowClear
              disabled={saving}
            >
              {(Array.isArray(menuItems) ? menuItems : []).map((m) => (
                <Option key={m.id} value={m.id}>
                  {m.title}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Link Type" name="link_type">
            <Radio.Group
              onChange={(e) => {
                setLinkType(e.target.value);
                form.setFieldsValue({ link: undefined });
              }}
              disabled={saving}
            >
              <Radio value="independent">Independent</Radio>
              <Radio value="page">Page</Radio>
            </Radio.Group>
          </Form.Item>
        </div>

        <Form.Item
          label="Item Link"
          name="link"
          rules={
            linkType === "page"
              ? [{ required: true, message: "Please select a page" }]
              : undefined
          }
        >
          {linkType === "page" ? (
            <Select
              showSearch
              placeholder="Select a page"
              optionFilterProp="children"
              disabled={saving}
            >
              {(Array.isArray(pages) ? pages : []).map((p) => (
                <Option key={p.id} value={p.slug}>
                  {p.page_name_en}
                </Option>
              ))}
            </Select>
          ) : (
            <Input
              placeholder="Menu Item Link (leave empty to auto-generate)"
              disabled={saving}
            />
          )}
        </Form.Item>
      </div>

      {showSubmitButton && (
        <div className="mt-4 flex justify-end">
          <Button
            type="primary"
            htmlType="submit"
            loading={saving}
            className="headlessbutton headlessbutton-pill !mr-0"
          >
            Create Menu
          </Button>
        </div>
      )}
    </Form>
  );
};

export default AddMenuItemForm;
