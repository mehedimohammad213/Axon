// pages/cards.jsx

import React, { useEffect, useState } from "react";
import { Empty, message, Spin, Pagination, Form } from "antd";
import { AppstoreOutlined } from "@ant-design/icons";
import instance from "../../axios";
import CardsHeader from "../../components/cards/CardsHeader";
import CardsList from "../../components/cards/CardsList";
import CreateCardForm from "../../components/cards/CreateCardForm";
import CardsPreviewModal from "../../components/cards/CardsPreviewModal";
import { useGlobalRefresh } from "../../src/context/MenuRefreshContext";

const CardsPage = () => {
  const [loading, setLoading] = useState(false);
  const [cardsData, setCardsData] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [pages, setPages] = useState([]);
  const [media, setMedia] = useState([]);
  const [viewType, setViewType] = useState("grid");
  const [isCreateCardFormVisible, setIsCreateCardFormVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("desc");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Page filter
  const [selectedPageFilter, setSelectedPageFilter] = useState(null);
  // Tag filter
  const [selectedTag, setSelectedTag] = useState(null);
  const [uniqueTags, setUniqueTags] = useState([]);

  const [form] = Form.useForm();

  // -------------------------
  //     Fetch Data
  // -------------------------
  const fetchData = async () => {
    setLoading(true);
    try {
      const [cardsResponse, mediaResponse, pagesResponse] = await Promise.all([
        instance.get("/cards"),
        instance.get("/media"),
        instance.get("/pages"),
      ]);

      if (
        cardsResponse.status === 200 &&
        mediaResponse.status === 200 &&
        pagesResponse.status === 200
      ) {
        setCardsData(cardsResponse.data);
        setFilteredCards(cardsResponse.data);
        setMedia(mediaResponse.data);
        setPages(pagesResponse.data);
      } else {
        message.error("Failed to fetch data.");
      }
    } catch (error) {
      message.error("Failed to fetch data.");
    }
    setLoading(false);
  };

  const fetchCards = async () => {
    try {
      const response = await instance.get("/cards");
      if (response.status === 200) {
        setCardsData(response.data);
      } else {
        message.error("Failed to fetch cards.");
      }
    } catch {
      message.error("Failed to fetch cards.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useGlobalRefresh(fetchData);

  // -------------------------
  //   Collect Unique Tags
  // -------------------------
  useEffect(() => {
    // Gather all tags from cardsData
    const tagSet = new Set();
    cardsData.forEach((card) => {
      const tags = card?.additional?.tags || [];
      tags.forEach((t) => tagSet.add(t));
    });
    setUniqueTags([...tagSet]);
  }, [cardsData]);

  // -------------------------
  //  Filter & Search & Sort
  // -------------------------
  useEffect(() => {
    let tempCards = [...cardsData];

    // Filter by search
    if (searchTerm.trim()) {
      tempCards = tempCards.filter((card) =>
        card?.title_en?.toLowerCase()?.includes(searchTerm.toLowerCase())
      );
    }

    // Filter by page
    if (selectedPageFilter) {
      tempCards = tempCards.filter(
        (card) => card.page_name === selectedPageFilter
      );
    }

    // Filter by tag
    if (selectedTag) {
      tempCards = tempCards.filter((card) =>
        card.additional?.tags?.includes(selectedTag)
      );
    }

    // Sorting
    tempCards.sort((a, b) => {
      if (sortType === "asc") {
        return new Date(a.created_at) - new Date(b.created_at);
      } else {
        return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    setFilteredCards(tempCards);
    setCurrentPage(1);
  }, [cardsData, searchTerm, sortType, selectedPageFilter, selectedTag]);

  // -------------------------
  //     Pagination
  // -------------------------
  const indexOfLastCard = currentPage * itemsPerPage;
  const indexOfFirstCard = indexOfLastCard - itemsPerPage;
  const currentCards = filteredCards.slice(indexOfFirstCard, indexOfLastCard);

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setItemsPerPage(pageSize);
  };

  // -------------------------
  //   Handlers
  // -------------------------
  const handleAddCard = () => {
    setIsCreateCardFormVisible(true);
  };

  const onItemsPerPageChange = (value) => {
    setItemsPerPage(parseInt(value, 10));
    setCurrentPage(1);
  };

  const onSearch = (value) => {
    setSearchTerm(value);
  };

  const handlePageFilterChange = (value) => {
    setSelectedPageFilter(value);
  };

  const handleTagFilterChange = (tagValue) => {
    setSelectedTag(tagValue);
  };

  // Delete
  const handleDeleteCard = async (cardId) => {
    try {
      await instance.delete(`/cards/${cardId}`);
      message.success("Card deleted successfully.");
      fetchData();
    } catch {
      message.error("Failed to delete card.");
    }
  };

  // Preview/Edit
  const handlePreviewCard = (card) => {
    setSelectedCard(card);
    setIsPreviewModalVisible(true);
    setIsEditing(false);
  };

  const handleEditCard = () => {
    setIsEditing(true);
    // Determine link type based on link_url
    const linkType =
      selectedCard.link_url &&
      (selectedCard.link_url.includes("page_id") ||
        selectedCard.link_url.includes("pageName"))
        ? "page"
        : "independent";
    // Parse link_page_id if page
    let linkPageId = null;
    if (linkType === "page") {
      const urlParams = new URLSearchParams(
        selectedCard.link_url.split("?")[1]
      );
      linkPageId = urlParams.get("page_id");
    }
    form.setFieldsValue({
      ...selectedCard,
      status: selectedCard.status === 1,
      page_name: selectedCard.page_name || undefined,
      media_ids: selectedCard.media_ids,
      link_type: linkType,
      link_page_id: linkPageId ? Number(linkPageId) : undefined,
      link_url: linkType === "independent" ? selectedCard.link_url : undefined,
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    form.resetFields();
  };

  const handleSaveEdit = async () => {
    try {
      const values = await form.validateFields();
      let link_url = values.link_url;
      let link_page_id = null;

      if (values.link_type === "page" && values.link_page_id) {
        const selectedPage = pages.find((p) => p.id === values.link_page_id);
        if (selectedPage) {
          link_url = `/${selectedPage.slug}?page_id=${selectedPage.id}&pageName=${selectedPage.page_name_en}`;
          link_page_id = selectedPage.id;
        } else {
          message.error("Selected page not found.");
          return;
        }
      }
      // Omit 'link_page_id'
      const { link_page_id: _, ...restValues } = values;

      const payload = {
        ...restValues,
        media_ids: values.media_ids,
        status: values.status ? 1 : 0,
        link_url,
        page_name: values.page_name,
      };

      await instance.put(`/cards/${selectedCard.id}`, payload);
      message.success("Card updated successfully.");
      setIsEditing(false);
      setIsPreviewModalVisible(false);
      fetchData();
    } catch {
      message.error("Failed to update card.");
    }
  };

  return (
    <div className="headlesscontainer rounded-xl bg-gray-50/80 px-4 pt-4 pb-10 sm:px-6 sm:pt-6 sm:pb-12">
      <CardsHeader
        onAddCard={handleAddCard}
        sortType={sortType}
        setSortType={setSortType}
        onShowChange={onItemsPerPageChange}
        onSearch={onSearch}
        searchTerm={searchTerm}
        pages={pages}
        selectedPageFilter={selectedPageFilter}
        handlePageFilterChange={handlePageFilterChange}
        uniqueTags={uniqueTags}
        selectedTag={selectedTag}
        handleTagFilterChange={handleTagFilterChange}
        onRefresh={fetchData}
        itemCount={cardsData.length}
      />

      {isCreateCardFormVisible && (
        <CreateCardForm
          onSuccess={() => {
            fetchData();
            setIsCreateCardFormVisible(false);
          }}
          onCancel={() => setIsCreateCardFormVisible(false)}
          pages={pages}
          media={media}
          uniqueTags={uniqueTags}
        />
      )}

      {loading ? (
        <div className="mt-6 flex items-center justify-center py-20">
          <Spin size="large" />
        </div>
      ) : filteredCards.length > 0 ? (
        <div className="mt-6">
          <CardsList
            cards={currentCards}
            viewType={viewType}
            media={media}
            pages={pages}
            onRefresh={fetchData}
            onDeleteCard={handleDeleteCard}
            onPreviewCard={handlePreviewCard}
          />
        </div>
      ) : (
        <div className="mt-6 flex items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16">
          <Empty
            image={
              <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-2xl text-brand-dark">
                <AppstoreOutlined />
              </div>
            }
            description={
              <div className="space-y-1">
                <p className="text-base font-medium text-gray-800">No cards found</p>
                <p className="text-sm text-gray-500">
                  Create a card or adjust your search filters.
                </p>
              </div>
            }
          />
        </div>
      )}

      {filteredCards.length > itemsPerPage && (
        <div className="mt-4 flex justify-center">
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <Pagination
              current={currentPage}
              pageSize={itemsPerPage}
              total={filteredCards.length}
              onChange={handlePageChange}
              showSizeChanger={false}
              className="[&_.ant-pagination-item-active]:border-brand [&_.ant-pagination-item-active_a]:text-brand-dark"
            />
          </div>
        </div>
      )}

      <CardsPreviewModal
        visible={isPreviewModalVisible}
        onCancel={() => {
          setIsPreviewModalVisible(false);
          setIsEditing(false);
          form.resetFields();
        }}
        selectedCard={selectedCard}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        form={form}
        handleSaveEdit={handleSaveEdit}
        handleEditCard={handleEditCard}
        handleCancelEdit={handleCancelEdit}
        pages={pages}
        media={media}
        uniqueTags={uniqueTags}
        fetchCards={fetchCards}
      />
    </div>
  );
};

export default CardsPage;
