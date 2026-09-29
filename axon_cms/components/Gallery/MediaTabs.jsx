// components/Gallery/MediaTabs.jsx

import React, { useMemo } from "react";
import { Tabs } from "antd";
import {
  AppstoreOutlined,
  CloudOutlined,
  FileOutlined,
  FileTextOutlined,
  PictureOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import MediaGrid from "./MediaGrid";
import Cloudinary from "./Cloudinary";

const TabLabel = ({ icon, label, count }) => (
  <span className="media-tab-label">
    <span className="media-tab-icon">{icon}</span>
    <span className="media-tab-text">{label}</span>
    {typeof count === "number" && (
      <span className="media-tab-count">{count}</span>
    )}
  </span>
);

const MediaTabs = ({
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
      docs.filter(
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
      docs.filter(
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

  const items = useMemo(
    () => [
      {
        key: "0",
        label: (
          <TabLabel
            icon={<AppstoreOutlined />}
            label="All"
            count={allMedia.length}
          />
        ),
        children: (
          <MediaGrid
            mediaItems={allMedia}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handlePreview={handlePreview}
            availableTags={availableTags}
          />
        ),
      },
      {
        key: "1",
        label: (
          <TabLabel
            icon={<PictureOutlined />}
            label="Images"
            count={images.length}
          />
        ),
        children: (
          <MediaGrid
            mediaItems={images}
            mediaType="image"
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handlePreview={handlePreview}
            availableTags={availableTags}
          />
        ),
      },
      {
        key: "2",
        label: (
          <TabLabel
            icon={<VideoCameraOutlined />}
            label="Videos"
            count={videos.length}
          />
        ),
        children: (
          <MediaGrid
            mediaItems={videos}
            mediaType="video"
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handlePreview={handlePreview}
            availableTags={availableTags}
          />
        ),
      },
      {
        key: "3",
        label: (
          <TabLabel
            icon={<FileTextOutlined />}
            label="Office"
            count={officeDocs.length}
          />
        ),
        children: (
          <MediaGrid
            mediaItems={officeDocs}
            mediaType="document"
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handlePreview={handlePreview}
            availableTags={availableTags}
          />
        ),
      },
      {
        key: "4",
        label: (
          <TabLabel
            icon={<FileOutlined />}
            label="Docs"
            count={otherDocs.length}
          />
        ),
        children: (
          <MediaGrid
            mediaItems={otherDocs}
            mediaType="document"
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handlePreview={handlePreview}
            availableTags={availableTags}
          />
        ),
      },
      {
        key: "5",
        label: <TabLabel icon={<CloudOutlined />} label="Cloudinary" />,
        children: <Cloudinary availableTags={availableTags} />,
      },
    ],
    [
      allMedia,
      images,
      videos,
      officeDocs,
      otherDocs,
      handleEdit,
      handleDelete,
      handlePreview,
      availableTags,
    ]
  );

  return (
    <Tabs
      defaultActiveKey="0"
      animated
      items={items}
      className="media-filter-tabs"
    />
  );
};

export default MediaTabs;
