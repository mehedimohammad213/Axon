import React, { useEffect, useState, useMemo } from "react";
import { Modal, Spin } from "antd";
import GalleryHeader from "./GalleryHeader";
import MediaTabs, { getMediaTabItems } from "./MediaTabs";
import PaginationComponent from "./PaginationComponent";
import PreviewModal from "./PreviewModal";
import UploadMediaTabs from "./UploadMediaTabs";
import useMediaData from "../../hooks/useMediaData";
import { setPageTitle } from "../../global/constants/pageTitle";
import { useGlobalRefresh } from "../../src/context/MenuRefreshContext";

const Gallery = () => {
  const {
    mediaAssets,
    totalMediaAssets,
    isLoading,
    currentPage,
    itemsPerPage,
    sortType,
    handlePageChange,
    handleItemsPerPageChange,
    handleSortTypeChange,
    handleSearch,
    handleTagFilterChange,
    addMedia,
    editMedia,
    deleteMedia,
    refreshMedia,
  } = useMediaData();

  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("0");
  const [uniqueTags, setUniqueTags] = useState([]);

  useEffect(() => {
    setPageTitle("Media");
  }, []);

  useGlobalRefresh(refreshMedia);

  useEffect(() => {
    const tagsSet = new Set();
    mediaAssets.forEach((media) => {
      if (Array.isArray(media.tags)) {
        media.tags.forEach((tag) => tagsSet.add(tag));
      }
    });
    setUniqueTags([...tagsSet]);
  }, [mediaAssets]);

  const images = useMemo(
    () => mediaAssets.filter((m) => m.file_type?.startsWith("image/")),
    [mediaAssets]
  );
  const videos = useMemo(
    () => mediaAssets.filter((m) => m.file_type?.startsWith("video/")),
    [mediaAssets]
  );
  const docs = useMemo(
    () => mediaAssets.filter((m) => m.file_type === "application/pdf"),
    [mediaAssets]
  );

  const tabItems = useMemo(
    () =>
      getMediaTabItems({
        allMedia: mediaAssets,
        images,
        videos,
        docs,
      }),
    [mediaAssets, images, videos, docs]
  );

  const handleAddMedia = () => setIsUploadModalVisible(true);
  const handleUploadModalClose = () => setIsUploadModalVisible(false);

  const handlePreview = (media) => {
    setSelectedMedia(media);
    setIsEditMode(false);
    setIsPreviewModalVisible(true);
  };

  const handleEditClick = (media) => {
    setSelectedMedia(media);
    setIsEditMode(true);
    setIsPreviewModalVisible(true);
  };

  const handlePreviewModalClose = () => {
    setIsPreviewModalVisible(false);
    setSelectedMedia(null);
    setIsEditMode(false);
  };

  const handleMediaUploadSuccess = async (newMedia) => {
    if (newMedia?.length || newMedia?.id) {
      await addMedia(newMedia);
    }
    await refreshMedia(1);
    handleUploadModalClose();
  };

  return (
    <div className="gallery-page">
      <Modal
        title={
          <div className="flex items-center gap-2 border-b border-gray-200 pb-4">
            <span>Upload Media</span>
          </div>
        }
        open={isUploadModalVisible}
        onCancel={handleUploadModalClose}
        footer={null}
        width={800}
        destroyOnClose
      >
        <UploadMediaTabs
          onUploadSuccess={handleMediaUploadSuccess}
          addMedia={addMedia}
        />
      </Modal>

      {selectedMedia && (
        <PreviewModal
          visible={isPreviewModalVisible}
          onClose={handlePreviewModalClose}
          media={selectedMedia}
          mediaType={
            selectedMedia?.file_type?.startsWith("image/")
              ? "image"
              : selectedMedia?.file_type?.startsWith("video/")
                ? "video"
                : "document"
          }
          handleEdit={editMedia}
          initialEditMode={isEditMode}
          availableTags={uniqueTags}
        />
      )}

      <GalleryHeader
        onCreate={handleAddMedia}
        onSearch={handleSearch}
        onTagFilterChange={handleTagFilterChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        itemsPerPage={itemsPerPage}
        sortType={sortType}
        setSortType={handleSortTypeChange}
        availableTags={uniqueTags}
        onRefresh={refreshMedia}
        itemCount={totalMediaAssets}
        tabItems={tabItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {isLoading ? (
        <div className="mt-6 flex items-center justify-center py-20">
          <Spin size="large" />
        </div>
      ) : (
        <div className="mt-6">
          <MediaTabs
            activeTab={activeTab}
            allMedia={mediaAssets}
            images={images}
            videos={videos}
            docs={docs}
            handleEdit={handleEditClick}
            handleDelete={deleteMedia}
            handlePreview={handlePreview}
          />
        </div>
      )}

      {!isLoading && totalMediaAssets > itemsPerPage && (
        <div className="mt-4 flex justify-center">
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <PaginationComponent
              current={currentPage}
              pageSize={itemsPerPage}
              total={totalMediaAssets}
              onChange={handlePageChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
