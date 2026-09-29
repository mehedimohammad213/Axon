// components/PageBuilder/CreatePageModal.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Drawer, Input, Button, Select, Form, message } from "antd";
import { PlusCircleOutlined, ThunderboltOutlined } from "@ant-design/icons";
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
  const [form] = Form.useForm();
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
  const [nestedSubmitting, setNestedSubmitting] = useState(false);

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

  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setSelectedMenuItemId(undefined);
      setSelectedNavbarId(undefined);
      setIsAddMenuItemOpen(false);
      setIsAddNavbarOpen(false);
      setIsAltTitleManuallyEdited(false);
    }
  }, [visible, form]);

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

  const linkSelectedMenuItemToPage = async (page, titleEn, titleBn) => {
    if (!selectedMenuItemId) return;

    const existing =
      menuItems.find((item) => item.id === selectedMenuItemId) || null;
    if (!existing) return;

    const link = buildPageLink(
      page,
      existing.title || titleEn,
      existing.parent_id || null
    );

    await instance.put(`/menuitems/${existing.id}`, {
      title: existing.title,
      title_bn: existing.title_bn || titleBn || existing.title,
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

  const handleCreatePage = async (values) => {
    const titleEn = (values.title_en || "").trim();
    const titleBn = (values.title_bn || "").trim();
    const slug = (values.slug || "").trim();

    if (!titleEn || !titleBn || (type !== "Footer" && !slug)) {
      message.error("All fields are required.");
      return;
    }

    if (type !== "Footer") {
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(slug)) {
        message.error(
          "Invalid slug format. Use only lowercase letters, numbers, and hyphens."
        );
        return;
      }
    }

    try {
      setLoading(true);
      const pagePayload = {
        page_name_en: titleEn,
        page_name_bn: titleBn,
        type: type,
        favicon_id: null,
        slug: type !== "Footer" ? slug : null,
        head: {
          title: titleEn,
          description: "",
          keywords: [],
          image: "",
          imageAlt: "",
        },
        additional: [
          {
            pageType: type,
            metaTitle: titleEn,
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
            await linkSelectedMenuItemToPage(response.data, titleEn, titleBn);
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
        form.resetFields();
        setSelectedMenuItemId(undefined);
        setSelectedNavbarId(undefined);
        setIsAltTitleManuallyEdited(false);
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
    form.resetFields();
    setSelectedMenuItemId(undefined);
    setSelectedNavbarId(undefined);
    setIsAddMenuItemOpen(false);
    setIsAddNavbarOpen(false);
    setIsAltTitleManuallyEdited(false);
    onCancel();
  };

  const handleGenerateSlug = () => {
    const titleEn = (form.getFieldValue("title_en") || "").trim();
    if (!titleEn) {
      message.info("Please enter the title first.");
      return;
    }
    form.setFieldsValue({
      slug: titleEn.toLowerCase().replace(/\s+/g, "-"),
    });
  };

  return (
    <>
      <Drawer
        open={visible}
        title={
          <div className="flex items-center gap-2">
            <img
              src={
                type === "Footer"
                  ? "/icons/headless/footer.svg"
                  : "/icons/headless/forms.svg"
              }
              alt={type}
              className="w-6"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <span>Create {type}</span>
          </div>
        }
        onClose={handleCancel}
        placement="right"
        width="min(720px, 92vw)"
        destroyOnClose
        rootClassName="media-preview-drawer org-form-drawer"
        footer={
          <div className="flex w-full justify-end">
            <Button
              type="primary"
              form="create-page-form"
              htmlType="submit"
              icon={<PlusCircleOutlined />}
              loading={loading}
              className="headlessbutton headlessbutton-pill !mr-0"
            >
              Create {type}
            </Button>
          </div>
        }
      >
        <Form
          id="create-page-form"
          form={form}
          layout="vertical"
          onFinish={handleCreatePage}
        >
          <div
            style={{
              border: "1px solid #e8eef5",
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              background: "#ffffff",
            }}
          >
            <div className="grid gap-x-4 md:grid-cols-2">
              <Form.Item
                label={`${type} Title`}
                name="title_en"
                rules={[{ required: true, message: "Title is required" }]}
              >
                <Input
                  placeholder={`Enter ${type.toLowerCase()} title`}
                  onChange={(e) => {
                    if (!isAltTitleManuallyEdited) {
                      form.setFieldsValue({ title_bn: e.target.value });
                    }
                  }}
                />
              </Form.Item>
              <Form.Item
                label={`${type} Alt Title`}
                name="title_bn"
                rules={[{ required: true, message: "Alt title is required" }]}
              >
                <Input
                  placeholder={`Enter ${type.toLowerCase()} alt title`}
                  onChange={() => setIsAltTitleManuallyEdited(true)}
                />
              </Form.Item>
            </div>

            {type !== "Footer" && (
              <Form.Item
                label={`${type} Slug`}
                required
                extra="Use only lowercase letters, numbers, and hyphens."
              >
                <div className="flex gap-2">
                  <Form.Item
                    name="slug"
                    noStyle
                    rules={[{ required: true, message: "Slug is required" }]}
                  >
                    <Input
                      placeholder={`Enter ${type.toLowerCase()} slug (e.g., about-us)`}
                      className="flex-1"
                    />
                  </Form.Item>
                  <Button
                    icon={<ThunderboltOutlined />}
                    onClick={handleGenerateSlug}
                    className="headlessbutton headlessbutton-pill !mr-0"
                    type="primary"
                  >
                    Generate
                  </Button>
                </div>
              </Form.Item>
            )}
          </div>

          {type !== "Footer" && (
            <div
              style={{
                border: "1px solid #e8eef5",
                borderRadius: 12,
                padding: 16,
                background: "#ffffff",
              }}
            >
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-sm font-semibold text-gray-700">
                      Menu Item
                    </label>
                    <Button
                      icon={<PlusCircleOutlined />}
                      onClick={() => setIsAddMenuItemOpen(true)}
                      className="headlessbutton headlessbutton-pill !mr-0"
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
                    onChange={(value) =>
                      setSelectedMenuItemId(value ?? undefined)
                    }
                    className="w-full"
                  >
                    {menuItems.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.title}
                      </Option>
                    ))}
                  </Select>
                  <span className="mt-1 block text-xs text-gray-500">
                    This page will be created under the selected menu item.
                  </span>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-sm font-semibold text-gray-700">
                      Navbar
                    </label>
                    <Button
                      icon={<PlusCircleOutlined />}
                      onClick={() => setIsAddNavbarOpen(true)}
                      className="headlessbutton headlessbutton-pill !mr-0"
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
                    onChange={(value) =>
                      setSelectedNavbarId(value ?? undefined)
                    }
                    className="w-full"
                  >
                    {navbars.map((navbar) => (
                      <Option key={navbar.id} value={navbar.id}>
                        {navbar.title_en ||
                          navbar.name ||
                          `Navbar #${navbar.id}`}
                      </Option>
                    ))}
                  </Select>
                  <span className="mt-1 block text-xs text-gray-500">
                    The selected menu item will be added under this navbar.
                  </span>
                </div>
              </div>
            </div>
          )}
        </Form>
      </Drawer>

      <Drawer
        open={isAddMenuItemOpen}
        onClose={() => setIsAddMenuItemOpen(false)}
        destroyOnClose
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
        width="min(720px, 92vw)"
        zIndex={1300}
        rootClassName="media-preview-drawer org-form-drawer"
        footer={
          <div className="flex w-full justify-end">
            <Button
              type="primary"
              form="add-menu-item-form-create-page"
              htmlType="submit"
              loading={nestedSubmitting}
              className="headlessbutton headlessbutton-pill !mr-0"
            >
              Create Menu
            </Button>
          </div>
        }
      >
        {isAddMenuItemOpen && (
          <AddMenuItemForm
            formId="add-menu-item-form-create-page"
            pages={pages}
            menuItems={menuItems}
            onCancel={() => setIsAddMenuItemOpen(false)}
            fetchMenuItems={fetchMenuItems}
            onMenuItemCreated={handleMenuItemCreated}
            onLoadingChange={setNestedSubmitting}
            showSubmitButton={false}
          />
        )}
      </Drawer>

      <Drawer
        open={isAddNavbarOpen}
        onClose={() => setIsAddNavbarOpen(false)}
        destroyOnClose
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
        width="min(800px, 92vw)"
        zIndex={1300}
        rootClassName="media-preview-drawer org-form-drawer"
        footer={
          <div className="flex w-full justify-end">
            <Button
              type="primary"
              form="add-navbar-form-create-page"
              htmlType="submit"
              loading={nestedSubmitting}
              className="headlessbutton headlessbutton-pill !mr-0"
            >
              Create Navbar
            </Button>
          </div>
        }
      >
        {isAddNavbarOpen && (
          <AddNavbarForm
            formId="add-navbar-form-create-page"
            onCancel={() => setIsAddNavbarOpen(false)}
            fetchNavbars={fetchNavbars}
            onNavbarCreated={handleNavbarCreated}
            initialMenuItemIds={
              selectedMenuItemId ? [selectedMenuItemId] : []
            }
            onLoadingChange={setNestedSubmitting}
            showSubmitButton={false}
          />
        )}
      </Drawer>
    </>
  );
};

export default CreatePageModal;
