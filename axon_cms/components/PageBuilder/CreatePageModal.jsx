// components/PageBuilder/CreatePageModal.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Modal, Input, Button, Select, message } from "antd";
import { PlusCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import instance from "../../axios";
import AddMenuItemForm from "../MenuItems/AddMenuItemForm";

const { Option } = Select;

const generateSlug = (text = "") =>
  text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

const CreatePageModal = ({
  visible,
  onCancel,
  onPageCreated,
  fetchPages,
  type = "Page",
}) => {
  const [newPageTitleEn, setNewPageTitleEn] = useState("");
  const [newPageTitleBn, setNewPageTitleBn] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAltTitleManuallyEdited, setIsAltTitleManuallyEdited] =
    useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [pages, setPages] = useState([]);
  const [selectedMenuItemId, setSelectedMenuItemId] = useState(undefined);
  const [isAddMenuItemOpen, setIsAddMenuItemOpen] = useState(false);

  useEffect(() => {
    if (!isAltTitleManuallyEdited) {
      setNewPageTitleBn(newPageTitleEn);
    }
  }, [newPageTitleEn, isAltTitleManuallyEdited]);

  const fetchMenuItems = useCallback(async () => {
    try {
      const response = await instance.get("/menuitems");
      if (Array.isArray(response.data)) {
        setMenuItems(response.data);
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  }, []);

  const fetchPagesList = useCallback(async () => {
    try {
      const response = await instance.get("/pages");
      if (Array.isArray(response.data)) {
        setPages(response.data);
      }
    } catch (error) {
      console.error("Error fetching pages:", error);
    }
  }, []);

  useEffect(() => {
    if (!visible || type === "Footer") return;
    fetchMenuItems();
    fetchPagesList();
  }, [visible, type, fetchMenuItems, fetchPagesList]);

  const buildParentPath = (selectedParentId) => {
    const slugs = [];
    let currentId = selectedParentId;
    while (currentId) {
      const parent = menuItems.find((item) => item.id === currentId);
      if (!parent) break;
      slugs.unshift(generateSlug(parent.title));
      currentId = parent.parent_id;
    }
    return slugs;
  };

  const buildPageLink = (page, title, selectedParentId) => {
    const slugs = buildParentPath(selectedParentId);
    slugs.push(generateSlug(title || page.page_name_en || page.slug));
    const pageName = generateSlug(page.page_name_en || "");
    return `/${slugs.join("/")}?pageId=${page.id}&pageName=${pageName}`;
  };

  const resetFormState = () => {
    setNewPageTitleEn("");
    setNewPageTitleBn("");
    setNewSlug("");
    setSelectedMenuItemId(undefined);
    setIsAddMenuItemOpen(false);
    setIsAltTitleManuallyEdited(false);
  };

  const handleMenuItemCreated = (createdItems = []) => {
    const created = createdItems[0];
    if (!created?.id) return;

    setMenuItems((prev) => {
      const existing = new Set(prev.map((item) => item.id));
      return [
        ...prev,
        ...createdItems.filter((item) => item?.id && !existing.has(item.id)),
      ];
    });
    setSelectedMenuItemId(created.id);
    setIsAddMenuItemOpen(false);
  };

  const linkSelectedMenuItemToPage = async (page) => {
    if (!selectedMenuItemId) return;

    const existing =
      menuItems.find((item) => item.id === selectedMenuItemId) || null;
    if (!existing) return;

    const link = buildPageLink(
      page,
      existing.title || newPageTitleEn,
      existing.parent_id || null
    );

    await instance.put(`/menuitems/${existing.id}`, {
      title: existing.title,
      title_bn: existing.title_bn || newPageTitleBn || existing.title,
      link,
      parent_id: existing.parent_id || null,
    });
    message.success("Menu item linked to page.");
  };

  const handleCreatePage = async () => {
    if (
      newPageTitleEn.trim() === "" ||
      newPageTitleBn.trim() === "" ||
      (type !== "Footer" && newSlug.trim() === "")
    ) {
      message.error("All fields are required.");
      return;
    }

    if (type !== "Footer") {
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(newSlug)) {
        message.error(
          "Invalid slug format. Use only lowercase letters, numbers, and hyphens."
        );
        return;
      }
    }

    try {
      setLoading(true);
      const response = await instance.post("/pages", {
        page_name_en: newPageTitleEn,
        page_name_bn: newPageTitleBn,
        type: type,
        favicon_id: null,
        slug: type !== "Footer" ? newSlug : null,
        head: {
          title: newPageTitleEn,
          description: "",
          keywords: [],
          image: "",
          imageAlt: "",
        },
        additional: [
          {
            pageType: type,
            metaTitle: newPageTitleEn,
            metaDescription: "",
            keywords: [],
            metaImage: "",
            metaImageAlt: "",
          },
        ],
      });

      if (response.status === 201) {
        if (type !== "Footer" && selectedMenuItemId) {
          try {
            await linkSelectedMenuItemToPage(response.data);
          } catch (menuError) {
            console.error("Error linking menu item:", menuError);
            message.warning(
              "Page created, but menu item could not be linked. You can update it from Menu Items."
            );
          }
        }

        message.success(`${type} created successfully.`);
        onPageCreated(response.data);
        resetFormState();
        fetchPages();
        onCancel();
      } else {
        message.error(`Failed to create ${type.toLowerCase()}.`);
      }
    } catch (error) {
      console.error(`Error creating ${type.toLowerCase()}:`, error);
      message.error(
        `An error occurred while creating the ${type.toLowerCase()}.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetFormState();
    onCancel();
  };

  const handleGenerateSlug = () => {
    if (newPageTitleEn.trim() === "") {
      message.info("Please enter the title first.");
      return;
    }
    const slug = newPageTitleEn.trim().toLowerCase().replace(/\s+/g, "-");
    setNewSlug(slug);
  };

  return (
    <>
      <Modal
        open={visible}
        title={`Create New ${type}`}
        onCancel={handleCancel}
        footer={null}
        centered
        className="create-modal"
        width={600}
        destroyOnClose
      >
        <div className="flex flex-col gap-6 p-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              {type} Title
            </label>
            <Input
              placeholder={`Enter ${type.toLowerCase()} title`}
              value={newPageTitleEn}
              onChange={(e) => setNewPageTitleEn(e.target.value)}
              className="text-lg h-12"
              size="large"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              {type} Alt Title
            </label>
            <Input
              placeholder={`Enter ${type.toLowerCase()} alt title`}
              value={newPageTitleBn}
              onChange={(e) => {
                setNewPageTitleBn(e.target.value);
                setIsAltTitleManuallyEdited(true);
              }}
              className="text-lg h-12"
              size="large"
            />
          </div>

          {type !== "Footer" && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                {type} Slug
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder={`Enter ${type.toLowerCase()} slug (e.g., about-us)`}
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  className="text-lg h-12 flex-1"
                  size="large"
                />
                <Button
                  onClick={handleGenerateSlug}
                  className="h-12 px-4 headlessbutton"
                  type="primary"
                >
                  Generate
                </Button>
              </div>
              <span className="text-xs text-gray-500">
                *Use only lowercase letters, numbers, and hyphens.
              </span>
            </div>
          )}

          {type !== "Footer" && (
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-gray-700">
                  Menu Item
                </label>
                <Button
                  icon={<PlusCircleOutlined />}
                  onClick={() => setIsAddMenuItemOpen(true)}
                  className="h-9 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 font-semibold shadow-md hover:shadow-lg transition-all rounded-lg text-xs"
                >
                  Create Item
                </Button>
              </div>
              <Select
                showSearch
                allowClear
                placeholder="Select a Menu Item"
                optionFilterProp="children"
                value={selectedMenuItemId}
                onChange={(value) => setSelectedMenuItemId(value ?? undefined)}
                className="w-full [&_.ant-select-selector]:h-10 [&_.ant-select-selector]:border-2 [&_.ant-select-selector]:border-gray-200 [&_.ant-select-selector]:rounded-lg hover:[&_.ant-select-selector]:border-blue-300"
              >
                {menuItems.map((item) => (
                  <Option key={item.id} value={item.id}>
                    {item.title}
                  </Option>
                ))}
              </Select>
              <span className="text-xs text-gray-500">
                Select an existing item or create a new one. It will be linked
                to this page on create.
              </span>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <Button
              onClick={handleCancel}
              icon={<CloseCircleOutlined />}
              className="h-10 px-6 headlesscancelbutton"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePage}
              icon={<PlusCircleOutlined />}
              loading={loading}
              className="h-10 px-6 headlessbutton"
              type="primary"
            >
              Create {type}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={isAddMenuItemOpen}
        onCancel={() => setIsAddMenuItemOpen(false)}
        destroyOnClose
        footer={null}
        title={
          <div className="flex items-center gap-2">
            <img
              src="/icons/headless/menuitems.svg"
              alt="Menu Items"
              className="w-6"
            />
            <span>Add Menu Item</span>
          </div>
        }
        width={900}
        zIndex={1300}
        getContainer={() => document.body}
      >
        {isAddMenuItemOpen && (
          <AddMenuItemForm
            pages={pages}
            menuItems={menuItems}
            onCancel={() => setIsAddMenuItemOpen(false)}
            fetchMenuItems={fetchMenuItems}
            onMenuItemCreated={handleMenuItemCreated}
          />
        )}
      </Modal>
    </>
  );
};

export default CreatePageModal;
