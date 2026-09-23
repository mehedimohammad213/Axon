import React, { useMemo, useState } from "react";
import {
  Row,
  Col,
  Input,
  Select,
  Button,
  Radio,
  message,
  Typography,
} from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
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
}) => {
  const [titleEn, setTitleEn] = useState(menuItem?.title || "");
  const [titleBn, setTitleBn] = useState(menuItem?.title_bn || "");
  const [parentId, setParentId] = useState(menuItem?.parent_id || null);
  const [linkType, setLinkType] = useState(
    isPageLink(menuItem?.link) ? "page" : "independent"
  );
  const [customLink, setCustomLink] = useState(
    isPageLink(menuItem?.link) ? "" : menuItem?.link || ""
  );
  const [pageSlug, setPageSlug] = useState(
    getPageSlugFromLink(menuItem?.link, pages)
  );
  const [saving, setSaving] = useState(false);

  const parentOptions = useMemo(
    () =>
      (Array.isArray(menuItems) ? menuItems : []).filter(
        (item) => item.id !== menuItem?.id
      ),
    [menuItems, menuItem?.id]
  );

  const buildLink = () => {
    if (linkType === "page") {
      const selectedPage = pages.find((page) => page.slug === pageSlug);
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

    if (customLink?.trim()) return customLink.trim();

    const slugs = buildParentPath(parentId, menuItems);
    slugs.push(generateSlug(titleEn));
    return `/${slugs.join("/")}`;
  };

  const handleSave = async () => {
    if (!titleEn.trim()) {
      message.error("Please provide a valid menu item title.");
      return;
    }
    if (linkType === "page" && !pageSlug) {
      message.error("Please select a page.");
      return;
    }

    const payload = {
      title: titleEn.trim(),
      title_bn: titleBn.trim() || null,
      parent_id: parentId || null,
      link: buildLink(),
    };

    if (!payload.link) {
      message.error("Please provide a valid menu item link.");
      return;
    }

    try {
      setSaving(true);
      const response = await instance.put(
        `/menuitems/${menuItem.id}`,
        payload
      );
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
    }
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Typography.Title level={5}>Item Name</Typography.Title>
          <Input
            placeholder="Menu Item Title"
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
          />
        </Col>
        <Col xs={24} md={12}>
          <Typography.Title level={5}>আইটেম নাম</Typography.Title>
          <Input
            placeholder="মেনু আইটেম শিরোনাম"
            value={titleBn}
            onChange={(e) => setTitleBn(e.target.value)}
          />
        </Col>

        <Col xs={24} md={12}>
          <Typography.Title level={5}>Parent Menu</Typography.Title>
          <Select
            showSearch
            placeholder="Select a Parent Menu"
            optionFilterProp="children"
            onChange={(value) => setParentId(value || null)}
            className="w-full mt-2"
            allowClear
            value={parentId || undefined}
          >
            {parentOptions.map((item) => (
              <Option key={item.id} value={item.id}>
                {item.title}
              </Option>
            ))}
          </Select>
        </Col>

        <Col xs={24} md={12}>
          <div className="flex justify-between">
            <Typography.Title level={5}>Item Link</Typography.Title>
            <Radio.Group
              value={linkType}
              onChange={(e) => setLinkType(e.target.value)}
            >
              <Radio value="independent">Independent</Radio>
              <Radio value="page">Page</Radio>
            </Radio.Group>
          </div>
          {linkType === "page" ? (
            <Select
              showSearch
              placeholder="Select a page"
              optionFilterProp="children"
              onChange={setPageSlug}
              className="w-full mt-2"
              value={pageSlug || undefined}
            >
              {(Array.isArray(pages) ? pages : []).map((page) => (
                <Option key={page.id} value={page.slug}>
                  {page.page_name_en}
                </Option>
              ))}
            </Select>
          ) : (
            <Input
              placeholder="Menu Item Link"
              value={customLink}
              onChange={(e) => setCustomLink(e.target.value)}
              className="mt-2"
            />
          )}
        </Col>
      </Row>

      <div className="flex justify-end mt-4 gap-5">
        <Button
          icon={<CheckCircleOutlined />}
          onClick={handleSave}
          loading={saving}
          className="headlessbutton"
        >
          Save changes
        </Button>
        <Button
          icon={<CloseCircleOutlined />}
          onClick={onCancel}
          className="headlesscancelbutton mr-2"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default EditMenuItemForm;
