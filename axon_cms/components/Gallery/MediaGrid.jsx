import React from "react";
import MediaCard from "./MediaCard";

const MediaGrid = ({
  mediaItems,
  mediaType,
  handleEdit,
  handleDelete,
  handlePreview,
  availableTags,
}) => {
  if (!mediaItems.length) {
    return (
      <p className="rounded-2xl border border-dashed border-gray-200 bg-white py-12 text-center text-gray-500">
        No media available.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
      {mediaItems.map((media) => (
        <MediaCard
          key={media.id}
          media={media}
          mediaType={mediaType}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handlePreview={handlePreview}
          availableTags={availableTags}
        />
      ))}
    </div>
  );
};

export default MediaGrid;
