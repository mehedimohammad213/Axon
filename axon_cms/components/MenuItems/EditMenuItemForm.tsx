import React, { useMemo, useState } from "react";
import { Form, Input, Select, Radio, Button, message } from "antd";
import instance from "../../axios";

const { Option } = Select;

const generateSlug = (text) =>
  (text || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

const isPageLink = (link) => Boolean(link && /[?&]pageId=/.test(link));

const getPageSlugFromLink = (link, pages = []) => {
  if (!link) return "";
  try {
    const url = new URL(link, "http://local.invalid");
    const pageId = url.searchParams.get("pageId");
    if (pageId) {
      const page = pages.find((item) => String(item.id) === String(pageId));
      if (page?.slug) return page.slug;
    }
  } catch {
    // fall through
  }
  return "";
};

const buildParentPath = (parentId, menuItems = []) => {
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

const EditMenuItemForm = ({
  menuItem,
  pages = [],
  menuItems = [],
  onCancel,
  onUpdated,
  formId = "edit-menu-item-form",
  onLoadingChange,
  showSubmitButton = true,
}) => {
  const initialLinkType = isPageLink(menuItem?.link) ? "page" : "independent";
  const [form] = Form.useForm();
  const [linkType, setLinkType] = useState(initialLinkType);
  const [saving, setSaving] = useState(false);

  const parentOptions = useMemo(
    () =>
      (Array.isArray(menuItems) ? menuItems : []).filter(
        (item) => item.id !== menuItem?.id
      ),
    [menuItems, menuItem?.id]
  );

  const buildLink = (values) => {
    const titleEn = (values.title || "").trim();
    const parentId = values.parent_id || null;

    if (linkType === "page") {
      const selectedPage = pages.find((page) => page.slug === values.link);
      const slugs = buildParentPath(parentId, menuItems);
      slugs.push(generateSlug(titleEn));
      const pageId = selectedPage ? selectedPage.id : "";
      const pageName = selectedPage
        ? generateSlug(selectedPage.page_name_en)
        : "";
      return `/${slugs.join("/")}${
        pageId ? `?pageId=${pageId}&pageName=${pageName}` : ""
      }`;
    }

    if (values.link?.trim()) return values.link.trim();

    const slugs = buildParentPath(parentId, menuItems);
    slugs.push(generateSlug(titleEn));
    return `/${slugs.join("/")}`;
  };

  const handleSave = async (values) => {
    const titleEn = (values.title || "").trim();
    if (!titleEn) {
      message.error("Please provide a valid menu item title.");
      return;
    }
    if (linkType === "page" && !values.link) {
      message.error("Please select a page.");
      return;
    }

    const payload = {
      title: titleEn,
      title_bn: (values.title_bn || "").trim() || null,
      parent_id: values.parent_id || null,
      link: buildLink(values),
    };

    if (!payload.link) {
      message.error("Please provide a valid menu item link.");
      return;
    }

    try {
      setSaving(true);
      onLoadingChange?.(true);
      const response = await instance.put(`/menuitems/${menuItem.id}`, payload);
      if (response.status === 200) {
        message.success("Menu item updated successfully");
        onUpdated?.(response.data);
        onCancel?.();
      } else {
        message.error("Error updating menu item");
      }
    } catch (error) {
      const apiMessage =
        error?.response?.data?.message ||
        (error?.response?.data?.errors &&
          Object.values(error.response.data.errors).flat().join(" "));
      message.error(apiMessage || "Error updating menu item");
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
      onFinish={handleSave}
      initialValues={{
        title: menuItem?.title || "",
        title_bn: menuItem?.title_bn || "",
        parent_id: menuItem?.parent_id || undefined,
        link_type: initialLinkType,
        link:
          initialLinkType === "page"
            ? getPageSlugFromLink(menuItem?.link, pages) || undefined
            : menuItem?.link || "",
      }}
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
              {parentOptions.map((item) => (
                <Option key={item.id} value={item.id}>
                  {item.title}
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
              {(Array.isArray(pages) ? pages : []).map((page) => (
                <Option key={page.id} value={page.slug}>
                  {page.page_name_en}
                </Option>
              ))}
            </Select>
          ) : (
            <Input placeholder="Menu Item Link" disabled={saving} />
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
            Update Menu
          </Button>
        </div>
      )}
    </Form>
  );
};

export default EditMenuItemForm;
