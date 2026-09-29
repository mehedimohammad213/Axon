// components/Gallery/MediaTabs.jsx

import React, { useMemo } from "react";
import MediaGrid from "./MediaGrid";
import Cloudinary from "./Cloudinary";
import { MediaTabLabel } from "../ui/MediaTabBar";

export const getMediaTabItems = ({ allMedia, images, videos, docs }) => {
  const officeDocs = (docs || []).filter(
    (doc) =>
      doc.file_type?.includes("word") ||
      doc.file_type?.includes("excel") ||
      doc.file_type?.includes("powerpoint") ||
      doc.file_type?.includes("officedocument") ||
      doc.file_type?.includes("msword") ||
      doc.file_type?.includes("spreadsheet") ||
      doc.file_type?.includes("presentation")
  );

  const otherDocs = (docs || []).filter(
    (doc) =>
      !doc.file_type?.includes("word") &&
      !doc.file_type?.includes("excel") &&
      !doc.file_type?.includes("powerpoint") &&
      !doc.file_type?.includes("officedocument") &&
      !doc.file_type?.includes("msword") &&
      !doc.file_type?.includes("spreadsheet") &&
      !doc.file_type?.includes("presentation")
  );

  return [
    {
      key: "0",
      label: <MediaTabLabel label="All" count={allMedia?.length || 0} />,
    },
    {
      key: "1",
      label: <MediaTabLabel label="Images" count={images?.length || 0} />,
    },
    {
      key: "2",
      label: <MediaTabLabel label="Videos" count={videos?.length || 0} />,
    },
    {
      key: "3",
      label: <MediaTabLabel label="Office" count={officeDocs.length} />,
    },
    {
      key: "4",
      label: <MediaTabLabel label="Docs" count={otherDocs.length} />,
    },
    {
      key: "5",
      label: <MediaTabLabel label="Cloudinary" />,
    },
  ];
};

const MediaTabs = ({
  activeTab = "0",
  allMedia,
  images,
  videos,
  docs,
  handleEdit,
  handleDelete,
  handlePreview,
  availableTags,
}) => {
  const officeDocs = useMemo(
    () =>
      (docs || []).filter(
        (doc) =>
          doc.file_type?.includes("word") ||
          doc.file_type?.includes("excel") ||
          doc.file_type?.includes("powerpoint") ||
          doc.file_type?.includes("officedocument") ||
          doc.file_type?.includes("msword") ||
          doc.file_type?.includes("spreadsheet") ||
          doc.file_type?.includes("presentation")
      ),
    [docs]
  );

  const otherDocs = useMemo(
    () =>
      (docs || []).filter(
        (doc) =>
          !doc.file_type?.includes("word") &&
          !doc.file_type?.includes("excel") &&
          !doc.file_type?.includes("powerpoint") &&
          !doc.file_type?.includes("officedocument") &&
          !doc.file_type?.includes("msword") &&
          !doc.file_type?.includes("spreadsheet") &&
          !doc.file_type?.includes("presentation")
      ),
    [docs]
  );

  const contentByKey = {
    "0": (
      <MediaGrid
        mediaItems={allMedia}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        handlePreview={handlePreview}
        availableTags={availableTags}
      />
    ),
    "1": (
      <MediaGrid
        mediaItems={images}
        mediaType="image"
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        handlePreview={handlePreview}
        availableTags={availableTags}
      />
    ),
    "2": (
      <MediaGrid
        mediaItems={videos}
        mediaType="video"
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        handlePreview={handlePreview}
        availableTags={availableTags}
      />
    ),
    "3": (
      <MediaGrid
        mediaItems={officeDocs}
        mediaType="document"
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        handlePreview={handlePreview}
        availableTags={availableTags}
      />
    ),
    "4": (
      <MediaGrid
        mediaItems={otherDocs}
        mediaType="document"
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        handlePreview={handlePreview}
        availableTags={availableTags}
      />
    ),
    "5": <Cloudinary availableTags={availableTags} />,
  };

  return (
    <div className="media-content-card">
      {contentByKey[activeTab] || contentByKey["0"]}
    </div>
  );
};

export default MediaTabs;
