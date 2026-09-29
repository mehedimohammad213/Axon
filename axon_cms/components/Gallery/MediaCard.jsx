import React from "react";
import { Card, Button, Tag, Popconfirm, Badge } from "antd";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import Image from "next/image";
import { capitalize } from "lodash";
import { resolveMediaUrl } from "../../utils/mediaUrl";

const idBadgeStyle = {
  backgroundColor: "#f0f0f0",
  color: "#666",
  fontSize: "12px",
  fontWeight: "500",
};

const MediaCard = ({ media, mediaType, handleDelete, handlePreview, handleEdit }) => {
  const actions = [
    <Button
      key="edit"
      icon={<EditOutlined />}
      onClick={() => handleEdit?.(media)}
      className="page-card-btn page-card-btn-primary !mr-0"
    >
      Edit
    </Button>,
    <Button
      key="preview"
      icon={<EyeOutlined />}
      onClick={() => handlePreview(media)}
      className="page-card-btn page-card-btn-soft !mr-0"
    >
      Preview
    </Button>,
    <Popconfirm
      key="delete"
      title="Move this media to trash?"
      description="You can restore it later from Trash."
      onConfirm={() => handleDelete(media.id)}
      okText="Move to trash"
      cancelText="Cancel"
      okButtonProps={{ danger: true }}
    >
      <Button
        className="page-card-btn page-card-btn-danger !mr-0"
        icon={<DeleteOutlined />}
      >
        Trash
      </Button>
    </Popconfirm>,
  ];

  // Check if the media is an image and has a supported format
  const resolvedMediaType = mediaType
    ? mediaType
    : media.file_type?.startsWith("image/")
      ? "image"
      : media.file_type?.startsWith("video/")
        ? "video"
        : "document";

  const isSupportedImageFormat = () => {
    const supportedFormats = [
      "image/png",
      "image/jpg",
      "image/jpeg",
      "image/svg+xml",
      "image/webp",
      "image/gif",
    ];
    return supportedFormats.includes(media.file_type);
  };

  const isSvgImage = () => {
    if (!media?.file_type && !media?.file_name) return false;
    return (
      media?.file_type === "image/svg+xml" ||
      media?.file_name?.toLowerCase().endsWith(".svg")
    );
  };

  const getMediaUrl = () => resolveMediaUrl(media.file_path);
  const coverClassName =
    "relative h-64 w-full overflow-hidden bg-gray-100";

  // Render media content based on type
  const renderMedia = () => {
    if (resolvedMediaType === "image") {
      if (isSupportedImageFormat()) {
        if (isSvgImage()) {
          return (
            <div
              className={`${coverClassName} flex items-center justify-center bg-white`}
            >
              <img
                src={getMediaUrl()}
                alt={media.file_name}
                className="max-h-full max-w-full p-4"
                loading="lazy"
                style={{ objectFit: "contain" }}
              />
            </div>
          );
        }
        return (
          <div className={coverClassName}>
            <Image
              src={getMediaUrl()}
              alt={media.file_name}
              layout="fill"
              objectFit="cover"
              objectPosition="center"
              sizes="(max-width: 768px) 100vw, 33vw"
              quality={80}
              loading="lazy"
            />
          </div>
        );
      } else {
        return (
          <div className={coverClassName}>
            <Image
              src="/images/Image_Placeholder.png"
              alt="Unsupported Image Format"
              layout="fill"
              objectFit="cover"
              sizes="(max-width: 768px) 100vw, 33vw"
              quality={80}
              loading="lazy"
            />
          </div>
        );
      }
    } else if (resolvedMediaType === "video") {
      return (
        <div className={`${coverClassName} bg-gray-900`}>
          <Image
            src={media.thumbnail_url || "/images/Video_Placeholder.png"}
            alt={media.file_name}
            layout="fill"
            objectFit="cover"
            sizes="(max-width: 768px) 100vw, 33vw"
            quality={80}
            loading="lazy"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black bg-opacity-50">
              <svg
                className="h-6 w-6 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="absolute bottom-2 right-2 rounded bg-black bg-opacity-75 px-2 py-1 text-xs text-white">
              Video
            </div>
          </div>
        </div>
      );
    } else {
      // Document preview
      const isOfficeDoc =
        media.file_type?.includes("word") ||
        media.file_type?.includes("excel") ||
        media.file_type?.includes("powerpoint");

      return (
        <div
          className={`${coverClassName} flex items-center justify-center`}
        >
          <div className="text-center">
            <div className="mb-2 text-4xl">
              {isOfficeDoc ? (
                <svg
                  className="mx-auto h-16 w-16 text-brand"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                </svg>
              ) : (
                <svg
                  className="mx-auto h-16 w-16 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                </svg>
              )}
            </div>
            <p className="text-sm text-gray-600">{media.file_name}</p>
          </div>
        </div>
      );
    }
  };

  return (
    <Card
      hoverable
      cover={renderMedia()}
      actions={actions}
      className="media-card slider-card page-list-card overflow-hidden shadow-md rounded-md"
    >
      <div className="flex flex-col pt-3">
        <div className="media-card-meta flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Badge count={`ID-${media.id}`} style={idBadgeStyle} />
            <h3 className="m-0 truncate text-base font-semibold">
              {media.title || media.file_name || "Title Unavailable"}
            </h3>
          </div>
          <h5 className="mb-0 shrink-0 text-sm font-bold text-gray-400">
            {capitalize(resolvedMediaType) || "Type Unavailable"}
          </h5>
        </div>

        {Array.isArray(media.tags) && media.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {media.tags.map((tagItem) => (
              <Tag
                key={tagItem}
                className="m-0 rounded-md border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-700"
              >
                {tagItem}
              </Tag>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default MediaCard;
