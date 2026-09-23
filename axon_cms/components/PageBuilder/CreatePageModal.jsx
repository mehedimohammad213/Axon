// components/PageBuilder/CreatePageModal.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Modal, Input, Button, Select, message } from "antd";
import { PlusCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import instance from "../../axios";
import AddMenuItemForm from "../MenuItems/AddMenuItemForm";
import AddNavbarForm from "../Navbars/AddNavbarForm";

const { Option } = Select;

const generateSlug = (text = "") =>
  text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

const makeId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const getNavbarMenuItemIds = (navbar) => {
  if (!navbar) return [];
  if (Array.isArray(navbar.menu_item_ids) && navbar.menu_item_ids.length) {
    return navbar.menu_item_ids;
  }
  return (navbar.menu_items || []).map((item) => item.id).filter(Boolean);
};

const buildNavbarSection = (navbar) => ({
  _id: makeId("section"),
  title: "Navbar",
  type: "header-section",
  _category: "root",
  data: [
    {
      type: "navbar",
      _id: makeId("component"),
      id: navbar.id,
      menuMode: "horizontal",
      menuTheme: "light",
      logoSize: "medium",
      _headless: navbar,
    },
  ],
});

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
  const [navbars, setNavbars] = useState([]);
  const [pages, setPages] = useState([]);
  const [selectedMenuItemId, setSelectedMenuItemId] = useState(undefined);
  const [selectedNavbarId, setSelectedNavbarId] = useState(undefined);
  const [isAddMenuItemOpen, setIsAddMenuItemOpen] = useState(false);
  const [isAddNavbarOpen, setIsAddNavbarOpen] = useState(false);

  useEffect(() => {
    if (!isAltTitleManuallyEdited) {
      setNewPageTitleBn(newPageTitleEn);
    }
  }, [newPageTitleEn, isAltTitleManuallyEdited]);

  const fetchMenuItems = useCallback(async () => {
    try {
      const response = await instance.get("/menuitems", {
        params: { page: 1, count: 100 },
      });
      if (Array.isArray(response.data)) {
        setMenuItems(response.data);
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  }, []);

  const fetchNavbars = useCallback(async () => {
    try {
      const response = await instance.get("/navbars", {
        params: { page: 1, count: 100 },
      });
      if (Array.isArray(response.data)) {
        setNavbars(response.data);
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching navbars:", error);
      return [];
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
    fetchNavbars();
  }, [visible, type, fetchMenuItems, fetchPagesList, fetchNavbars]);

  const selectedNavbar = useMemo(
    () => navbars.find((navbar) => navbar.id === selectedNavbarId) || null,
    [navbars, selectedNavbarId]
  );

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
    setSelectedNavbarId(undefined);
    setIsAddMenuItemOpen(false);
    setIsAddNavbarOpen(false);
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

  const handleNavbarCreated = async (createdNavbar) => {
    if (!createdNavbar?.id) return;

    const freshNavbars = await fetchNavbars();
    const fullNavbar =
      freshNavbars.find((navbar) => navbar.id === createdNavbar.id) ||
      createdNavbar;

    setSelectedNavbarId(fullNavbar.id);

    if (!selectedMenuItemId) {
      const firstMenuItemId = getNavbarMenuItemIds(fullNavbar)[0];
      if (firstMenuItemId) {
        setSelectedMenuItemId(firstMenuItemId);
      }
    }

    setIsAddNavbarOpen(false);
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

  const linkSelectedMenuItemToNavbar = async () => {
    if (!selectedMenuItemId || !selectedNavbarId) return;

    const response = await instance.get(`/navbars/${selectedNavbarId}`);
    const navbar = response.data;
    if (!navbar?.id) return;

    const existingIds = getNavbarMenuItemIds(navbar);
    if (existingIds.some((id) => String(id) === String(selectedMenuItemId))) {
      return;
    }

    await instance.put(`/navbars/${navbar.id}`, {
      title_en: navbar.title_en,
      title_bn: navbar.title_bn || "",
      logo_id: navbar.logo_id || navbar.logo?.id,
      menu_item_ids: [...existingIds, selectedMenuItemId],
    });
    message.success("Menu item added to navbar.");
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
      const pagePayload = {
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
      };

      if (type !== "Footer" && selectedNavbar) {
        pagePayload.body = [buildNavbarSection(selectedNavbar)];
      }

      const response = await instance.post("/pages", pagePayload);

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

        if (type !== "Footer" && selectedMenuItemId && selectedNavbarId) {
          try {
            await linkSelectedMenuItemToNavbar();
          } catch (navbarError) {
            console.error("Error adding menu item to navbar:", navbarError);
            message.warning(
              "Page created, but menu item could not be added to the navbar. You can update it from Navbars."
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
        width={640}
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
            <div className="pt-4 border-t border-gray-200 space-y-5">
              <div className="space-y-3">
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
                  This page will be created under the selected menu item.
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-gray-700">
                    Navbar
                  </label>
                  <Button
                    icon={<PlusCircleOutlined />}
                    onClick={() => setIsAddNavbarOpen(true)}
                    className="h-9 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 font-semibold shadow-md hover:shadow-lg transition-all rounded-lg text-xs"
                  >
                    Create Navbar
                  </Button>
                </div>
                <Select
                  showSearch
                  allowClear
                  placeholder="Select a Navbar"
                  optionFilterProp="children"
                  value={selectedNavbarId}
                  onChange={(value) => setSelectedNavbarId(value ?? undefined)}
                  className="w-full [&_.ant-select-selector]:h-10 [&_.ant-select-selector]:border-2 [&_.ant-select-selector]:border-gray-200 [&_.ant-select-selector]:rounded-lg hover:[&_.ant-select-selector]:border-blue-300"
                >
                  {navbars.map((navbar) => (
                    <Option key={navbar.id} value={navbar.id}>
                      {navbar.title_en || navbar.name || `Navbar #${navbar.id}`}
                    </Option>
                  ))}
                </Select>
                <span className="text-xs text-gray-500">
                  The selected menu item will be added under this navbar.
                </span>
              </div>
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

      <Modal
        open={isAddNavbarOpen}
        onCancel={() => setIsAddNavbarOpen(false)}
        destroyOnClose
        footer={null}
        title={
          <div className="flex items-center gap-2">
            <img
              src="/icons/headless/navbar.svg"
              alt="Navbars"
              className="w-6"
            />
            <span>Add Navbar</span>
          </div>
        }
        width={900}
        zIndex={1300}
        getContainer={() => document.body}
      >
        {isAddNavbarOpen && (
          <AddNavbarForm
            onCancel={() => setIsAddNavbarOpen(false)}
            fetchNavbars={fetchNavbars}
            onNavbarCreated={handleNavbarCreated}
            initialMenuItemIds={
              selectedMenuItemId ? [selectedMenuItemId] : []
            }
          />
        )}
      </Modal>
    </>
  );
};

export default CreatePageModal;
