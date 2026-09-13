// pages/pages.jsx

import { message, Pagination, Spin } from "antd";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import instance from "../../axios";
import { cachedApiCall } from "../../utils/apiUtils";
import { useGlobalRefresh } from "../../src/context/MenuRefreshContext";
import { useRouter } from "next/router";
import PagesHeader from "../../components/PageBuilder/PagesHeader";
import CreatePageModal from "../../components/PageBuilder/CreatePageModal";
import RenderPages from "../../components/PageBuilder/Renderpages";

const Pages = () => {
  const [allPages, setAllPages] = useState([]);
  const [typePages, setTypePages] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [expandedPageId, setExpandedPageId] = useState(null);
  const [sortType, setSortType] = useState("desc");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const router = useRouter();

  const sortedTypePages = useMemo(() => {
    return [...typePages].sort((a, b) =>
      sortType === "asc" ? a.id - b.id : b.id - a.id
    );
  }, [typePages, sortType]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortType, itemsPerPage]);

  const paginatedPages = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedTypePages.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedTypePages, currentPage, itemsPerPage]);

  const fetchMenuItems = useCallback(async (forceRefresh = false) => {
    try {
      const response = await cachedApiCall(
        "menuitems",
        () => instance.get("/menuitems"),
        undefined,
        { force: forceRefresh }
      );
      if (Array.isArray(response.data)) {
        setMenuItems(response.data);
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  }, []);

  const fetchPages = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      const response = await cachedApiCall(
        "pages",
        () => instance.get("/pages"),
        undefined,
        { force: forceRefresh }
      );

      if (response.data) {
        setAllPages(response.data);
        setTypePages(response.data.filter((page) => page.type === "Page"));
      } else {
        message.error("Failed to fetch pages.");
      }
    } catch (error) {
      console.error("Error fetching pages:", error);
      message.error("An error occurred while fetching pages.");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAll = useCallback(
    async (forceRefresh = false) => {
      await Promise.all([
        fetchPages(forceRefresh),
        fetchMenuItems(forceRefresh),
      ]);
    },
    [fetchPages, fetchMenuItems]
  );

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useGlobalRefresh(() => refreshAll(true));

  const handleExpand = useCallback((pageId) => {
    setExpandedPageId((prevId) => (prevId === pageId ? null : pageId));
  }, []);

  const handleDeletePage = useCallback(async (deletePageId) => {
    try {
      await instance.delete(`/pages/${deletePageId}`);
      message.success("Page deleted successfully.");
      setTypePages((prevPages) =>
        prevPages.filter((page) => page.id !== deletePageId)
      );
    } catch (error) {
      console.error("Error deleting page:", error);
      message.error("An error occurred while deleting the page.");
    }
  }, []);

  const handleDuplicatePage = useCallback(
    async (pageId) => {
      try {
        const originalPageResponse = await instance.get(`/pages/${pageId}`);
        const originalPage = originalPageResponse.data;

        const duplicatedPageData = {
          page_name_en: `${originalPage.page_name_en} (Copy)`,
          page_name_bn: `${originalPage.page_name_bn || originalPage.page_name_en} (Copy)`,
          type: originalPage.type,
          favicon_id: originalPage.favicon_id || null,
          slug: originalPage.slug ? `${originalPage.slug}-copy` : null,
          head: originalPage.head || {
            title: `${originalPage.page_name_en} (Copy)`,
            description: "",
            keywords: [],
            image: "",
            imageAlt: "",
          },
          additional: originalPage.additional || [
            {
              pageType: originalPage.type,
              metaTitle: `${originalPage.page_name_en} (Copy)`,
              metaDescription: "",
              keywords: [],
              metaImage: "",
              metaImageAlt: "",
            },
          ],
          body: originalPage.body || [],
        };

        const response = await instance.post("/pages", duplicatedPageData);

        if (response.status === 201) {
          message.success("Page duplicated successfully.");
          fetchPages(true);
        }
      } catch (error) {
        console.error("Error duplicating page:", error);
        message.error("An error occurred while duplicating the page.");
      }
    },
    [fetchPages]
  );

  const handlePreviewPage = useCallback(
    (id) => {
      router.push(`/page-preview/${id}`);
    },
    [router]
  );

  const handleEditPageInfo = useCallback(async (pageData) => {
    try {
      const {
        id,
        pageNameEn,
        pageNameBn,
        slug,
        pageType,
        type,
        metaTitle,
        metaDescription,
        keywords,
        metaImage,
        metaImageAlt,
      } = pageData;

      const response = await instance.put(`/pages/${id}`, {
        page_name_en: pageNameEn,
        page_name_bn: pageNameBn,
        slug,
        type,
        additional: [
          { pageType, metaTitle, metaDescription, keywords, metaImage, metaImageAlt },
        ],
      });

      if (response.status === 200) {
        message.success("Page info updated successfully.");
        setTypePages((prevPages) =>
          prevPages?.map((page) =>
            page.id === id
              ? {
                  ...page,
                  page_name_en: pageNameEn,
                  page_name_bn: pageNameBn,
                  slug,
                  type,
                  additional: [
                    {
                      pageType,
                      metaTitle,
                      metaDescription,
                      keywords,
                      metaImage,
                      metaImageAlt,
                    },
                  ],
                }
              : page
          )
        );
      } else {
        message.error("Failed to update page info.");
      }
    } catch (error) {
      console.error("Error updating page info:", error);
      message.error("An error occurred while updating the page info.");
    }
  }, []);

  const handlePageSearch = useCallback(
    (searchText) => {
      setCurrentPage(1);
      if (!searchText.trim()) {
        setTypePages(allPages.filter((page) => page.type === "Page"));
        return;
      }

      const filteredPages = allPages.filter((page) =>
        page.page_name_en.toLowerCase().includes(searchText.toLowerCase())
      );

      setTypePages(filteredPages.filter((page) => page.type === "Page"));
    },
    [allPages]
  );

  const handlePageCreated = useCallback((newPage) => {
    setTypePages((prevPages) => [newPage, ...prevPages]);
  }, []);

  const openCreateModal = useCallback(() => setCreateModalVisible(true), []);
  const closeCreateModal = useCallback(() => setCreateModalVisible(false), []);

  const handleShowChange = useCallback(
    (value) => setItemsPerPage(parseInt(value, 10)),
    []
  );

  if (loading) {
    return (
      <div className="headlesscontainer flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="headlesscontainer rounded-xl bg-gray-50/80 px-4 pt-4 pb-10 sm:px-6 sm:pt-6 sm:pb-12">
      <PagesHeader
        section="pages"
        title="Pages"
        onSearch={handlePageSearch}
        onCreate={openCreateModal}
        createMode={createModalVisible}
        onCancelCreate={closeCreateModal}
        sortType={sortType}
        setSortType={setSortType}
        onShowChange={handleShowChange}
        onRefresh={() => refreshAll(true)}
        totalPages={typePages.length}
      />

      <CreatePageModal
        visible={createModalVisible}
        onCancel={closeCreateModal}
        onPageCreated={(newPage) => {
          handlePageCreated(newPage);
          fetchMenuItems(true);
        }}
        fetchPages={() => refreshAll(true)}
      />

      <RenderPages
        webpages={paginatedPages}
        menuItems={menuItems}
        handleExpand={handleExpand}
        expandedPageId={expandedPageId}
        handleDeletePage={handleDeletePage}
        handlePreviewPage={handlePreviewPage}
        handleEditPageInfo={handleEditPageInfo}
        handleDuplicatePage={handleDuplicatePage}
        onCreate={openCreateModal}
      />

      {sortedTypePages.length > itemsPerPage && (
        <div className="mt-4 flex justify-center">
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <Pagination
              current={currentPage}
              pageSize={itemsPerPage}
              total={sortedTypePages.length}
              onChange={setCurrentPage}
              showSizeChanger={false}
              className="[&_.ant-pagination-item-active]:border-brand [&_.ant-pagination-item-active_a]:text-brand-dark"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Pages;
