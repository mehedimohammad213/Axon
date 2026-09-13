import React, { useEffect, useState } from "react";
import { Modal, Spin } from "antd";
import GalleryHeader from "./GalleryHeader";
import MediaTabs from "./MediaTabs";
import PaginationComponent from "./PaginationComponent";
import PreviewModal from "./PreviewModal";
import UploadMediaTabs from "./UploadMediaTabs";
import useMediaData from "../../hooks/useMediaData";
import { setPageTitle } from "../../global/constants/pageTitle";
import { useGlobalRefresh } from "../../src/context/MenuRefreshContext";

const Gallery = () => {
  // Use the custom hook to manage media data
  const {
    mediaAssets,
    totalMediaAssets,
    isLoading,
    currentPage,
    itemsPerPage,
    sortType,
    searchText,
    selectedTag,
    handlePageChange,
    handleItemsPerPageChange,
    handleSortTypeChange,
    handleSearch,
    handleTagFilterChange,
    addMedia, // This function adds media to the state and IndexedDB
    editMedia,
    deleteMedia,
    isIndexedDBLoaded,
    refreshMedia,
  } = useMediaData();

  // UI States for Modals
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = React.useState(null);
  const [isUploadModalVisible, setIsUploadModalVisible] = React.useState(false);

  // State for Unique Tags
  const [uniqueTags, setUniqueTags] = useState([]);

  // Set the page title
  useEffect(() => {
    setPageTitle("Media Library");
  }, []);

  useGlobalRefresh(refreshMedia);

  // Extract unique tags from mediaAssets
  useEffect(() => {
    const tagsSet = new Set();
    mediaAssets.forEach((media) => {
      if (Array.isArray(media.tags)) {
        media.tags.forEach((tag) => tagsSet.add(tag));
      }
    });
    setUniqueTags([...tagsSet]);
  }, [mediaAssets]);

  // Handlers for opening and closing modals
  const handleAddMedia = () => setIsUploadModalVisible(true);
  const handleUploadModalClose = () => setIsUploadModalVisible(false);

  const handlePreview = (media) => {
    setSelectedMedia(media);
    setIsPreviewModalVisible(true);
  };

  const handlePreviewModalClose = () => {
    setIsPreviewModalVisible(false);
    setSelectedMedia(null);
  };

  // Callback function to update mediaAssets after upload
  const handleMediaUploadSuccess = async (newMedia) => {
    handleUploadModalClose();
    if (newMedia?.length || newMedia?.id) {
      await addMedia(newMedia);
    }
    await refreshMedia();
  };

  return (
    <div className="gallery-page">
      {/* Upload Modal */}
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
      >
        <UploadMediaTabs
          onUploadSuccess={handleMediaUploadSuccess} // Pass the callback
          addMedia={addMedia}
        />
      </Modal>

      {/* Preview Modal */}
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
          availableTags={uniqueTags} // Pass uniqueTags to PreviewModal
        />
      )}

      {/* Gallery Header */}
      <GalleryHeader
        onCreate={handleAddMedia}
        onFilter={() => {
          /* Implement if needed */
        }}
        onSearch={handleSearch}
        onTagFilterChange={handleTagFilterChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        itemsPerPage={itemsPerPage}
        sortType={sortType}
        setSortType={handleSortTypeChange}
        availableTags={uniqueTags}
        onRefresh={refreshMedia}
        itemCount={totalMediaAssets}
      />

      {/* Media Grid or Loading Spinner */}
      {isLoading ? (
        <div className="mt-6 flex items-center justify-center py-20">
          <Spin size="large" />
        </div>
      ) : (
        <div className="mt-6">
          <MediaTabs
          allMedia={mediaAssets}
          images={mediaAssets.filter((m) => m.file_type?.startsWith("image/"))}
          videos={mediaAssets.filter((m) => m.file_type?.startsWith("video/"))}
          docs={mediaAssets.filter((m) => m.file_type === "application/pdf")}
          handleEdit={editMedia}
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
