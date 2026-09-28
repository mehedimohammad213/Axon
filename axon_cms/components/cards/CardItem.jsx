// components/cards/CardItem.jsx
import React from "react";
import { Card, Button, Popconfirm, List, Tag, Badge } from "antd";
import { EyeOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import Image from "next/image";
import { resolveMediaUrl } from "../../utils/mediaUrl";

const idBadgeStyle = {
  backgroundColor: "#f0f0f0",
  color: "#666",
  fontSize: "12px",
  fontWeight: "500",
};

const coverClassName = "relative h-64 w-full overflow-hidden bg-gray-100";

function getExcerpt(html = "", length = 30) {
  if (!html || html.trim() === "") return "Not Available";
  if (html.length <= length) return html;
  return html.slice(0, length) + "...";
}

function getCardMedia(card, mediaList = []) {
  let media = card?.media_files;
  if (Array.isArray(media)) media = media[0] || null;
  if (media?.file_path) return media;

  if (card?.media_ids != null && mediaList?.length) {
    const id = Array.isArray(card.media_ids)
      ? card.media_ids[0]
      : card.media_ids;
    return mediaList.find((item) => String(item.id) === String(id)) || null;
  }

  return null;
}

function MediaCover({ card, mediaList }) {
  const mediaFile = getCardMedia(card, mediaList);

  if (!mediaFile?.file_path) {
    return (
      <div className={coverClassName}>
        <Image
          alt="No Media"
          src="/images/Image_Placeholder.png"
          layout="fill"
          objectFit="cover"
        />
      </div>
    );
  }

  const isVideo = mediaFile.file_type?.startsWith("video/");
  const mediaUrl = resolveMediaUrl(mediaFile.file_path);
  const [isPlaying, setIsPlaying] = React.useState(false);

  const handlePlayClick = (e) => {
    e.stopPropagation();
    setIsPlaying(true);
    const videoElement =
      e.currentTarget.parentElement.parentElement.querySelector("video");
    if (videoElement) {
      videoElement.play();
    }
  };

  const handleVideoClick = (e) => {
    e.stopPropagation();
    const videoElement = e.currentTarget;
    if (videoElement.paused) {
      videoElement.play();
      setIsPlaying(true);
    } else {
      videoElement.pause();
      setIsPlaying(false);
    }
  };

  if (isVideo) {
    return (
      <div className={`${coverClassName} bg-gray-900`}>
        <video
          className="h-full w-full cursor-pointer object-cover"
          preload="metadata"
          muted={!isPlaying}
          playsInline
          onClick={handleVideoClick}
          onEnded={() => setIsPlaying(false)}
          onPause={() => setIsPlaying(false)}
        >
          <source src={`${mediaUrl}#t=0.1`} type={mediaFile.file_type} />
        </video>
        {!isPlaying && (
          <div
            className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black bg-opacity-30"
            onClick={handlePlayClick}
          >
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
        )}
      </div>
    );
  }

  return (
    <div className={coverClassName}>
      <Image
        alt={card?.title_en || "No Title"}
        src={mediaUrl || "/images/Image_Placeholder.png"}
        layout="fill"
        objectFit="cover"
      />
    </div>
  );
}

const CardItem = ({
  card,
  media,
  viewType,
  onDeleteCard,
  onPreviewCard,
  onEditCard,
}) => {
  const tags = Array.isArray(card?.additional?.tags)
    ? card.additional.tags
    : [];

  const actions = [
    <Button
      key="preview"
      icon={<EyeOutlined />}
      onClick={() => onPreviewCard(card)}
      className="headlessbutton headlessbutton-pill !mr-0"
    >
      Preview
    </Button>,
    <Button
      key="edit"
      icon={<EditOutlined />}
      onClick={() => onEditCard?.(card)}
      className="headlessbutton headlessbutton-pill !mr-0"
    >
      Edit
    </Button>,
    <Popconfirm
      key="delete"
      title="Are you sure you want to delete this card?"
      onConfirm={() => onDeleteCard(card.id)}
      okText="Yes"
      cancelText="No"
      okButtonProps={{ danger: true }}
    >
      <Button
        className="headlesscancelbutton headlessbutton-pill !mr-0"
        icon={<DeleteOutlined />}
      >
        Delete
      </Button>
    </Popconfirm>,
  ];

  if (viewType === "grid") {
    return (
      <Card
        hoverable
        cover={<MediaCover card={card} mediaList={media} />}
        actions={actions}
        className="media-card slider-card page-list-card overflow-hidden shadow-md rounded-md"
      >
        <div className="flex flex-col pt-3">
          <div className="media-card-meta flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <Badge count={`ID-${card.id}`} style={idBadgeStyle} />
              <h3 className="m-0 truncate text-base font-semibold">
                {card?.title_en || "Title Unavailable"}
              </h3>
            </div>
            <h5 className="mb-0 shrink-0 text-sm font-bold text-gray-400">
              {card?.page_name || "Card"}
            </h5>
          </div>

          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((tagItem) => (
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
  }

  const listMedia = getCardMedia(card, media);
  return (
    <List.Item actions={actions}>
      <List.Item.Meta
        avatar={
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden bg-gray-200">
            <Image
              alt={card?.title_en || "No Title"}
              src={
                listMedia?.file_path
                  ? resolveMediaUrl(listMedia.file_path)
                  : "/images/Image_Placeholder.png"
              }
              width={100}
              height={100}
              objectFit="cover"
            />
          </div>
        }
        title={
          <div className="flex items-center gap-2 flex-wrap">
            <Badge count={`ID-${card.id}`} style={idBadgeStyle} />
            <span>{card?.title_en || "Title Unavailable"}</span>
          </div>
        }
        description={
          <>
            <div
              dangerouslySetInnerHTML={{
                __html: getExcerpt(card?.description_en || "", 100),
              }}
            />
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((tagItem) => (
                  <Tag
                    key={tagItem}
                    className="m-0 rounded-md border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-700"
                  >
                    {tagItem}
                  </Tag>
                ))}
              </div>
            )}
          </>
        }
      />
    </List.Item>
  );
};

export default CardItem;
