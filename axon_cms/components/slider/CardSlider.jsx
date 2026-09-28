import React from "react";
import {
  Carousel,
  Button,
  Popconfirm,
  Card,
  Tag,
  Badge,
} from "antd";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import Image from "next/image";
import { capitalize } from "lodash";
import { orderByIds } from "./SliderForm/orderByIds";
import { resolveMediaUrl } from "../../utils/mediaUrl";

const idBadgeStyle = {
  backgroundColor: "#f0f0f0",
  color: "#666",
  fontSize: "12px",
  fontWeight: "500",
};

function getCardMedia(card) {
  const media = card?.media_files;
  if (!media) return null;
  return Array.isArray(media) ? media[0] || null : media;
}

const CardSlider = ({
  slider,
  handlePreviewClick,
  handleEditClick,
  handleDeleteSlider,
}) => {
  const cardPlaceholder = "/images/Image_Placeholder.png";

  const actions = [
    <Button
      key="preview"
      icon={<EyeOutlined />}
      onClick={() => handlePreviewClick?.(slider)}
      className="headlessbutton headlessbutton-pill"
    >
      Preview
    </Button>,
    <Button
      key="edit"
      icon={<EditOutlined />}
      onClick={() => handleEditClick(slider.id)}
      className="headlessbutton headlessbutton-pill"
    >
      Edit
    </Button>,
    <Popconfirm
      key="delete"
      title="Are you sure you want to delete this slider?"
      onConfirm={() => handleDeleteSlider(slider.id)}
      okText="Yes"
      cancelText="No"
      okButtonProps={{ danger: true }}
    >
      <Button className="headlesscancelbutton headlessbutton-pill" icon={<DeleteOutlined />}>
        Delete
      </Button>
    </Popconfirm>,
  ];

  const hasCards = Array.isArray(slider.cards) && slider.cards.length > 0;
  const orderedCards = orderByIds(slider.cards || [], slider.card_ids || []);

  return (
    <Card
      hoverable
      cover={
        hasCards ? (
          <Carousel autoplay className="mb-4">
            {orderedCards.map((card) => {
              const mediaFile = getCardMedia(card);
              return (
                <div key={card.id}>
                  <div className="relative h-64 w-full overflow-hidden bg-gray-100">
                    <Image
                      src={
                        mediaFile?.file_path
                          ? resolveMediaUrl(mediaFile.file_path)
                          : cardPlaceholder
                      }
                      alt={card.title_en || "Card Unavailable"}
                      layout="fill"
                      objectFit="cover"
                      unoptimized
                    />
                  </div>
                </div>
              );
            })}
          </Carousel>
        ) : (
          <div className="relative flex h-64 w-full items-center justify-center overflow-hidden bg-gray-100">
            <Image
              src={cardPlaceholder}
              alt="Placeholder Card"
              layout="fill"
              objectFit="cover"
            />
          </div>
        )
      }
      actions={actions}
      className="media-card slider-card h-full overflow-hidden shadow-md rounded-md"
    >
      <div className="flex min-h-16 flex-1 flex-col pt-4">
        <div className="media-card-meta flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Badge count={`ID-${slider.id}`} style={idBadgeStyle} />
            <h3 className="m-0 truncate text-lg font-semibold">
              {slider.title_en || "Title Unavailable"}
            </h3>
          </div>
          <h5 className="mb-0 shrink-0 text-md font-bold text-gray-400">
            {capitalize(slider.type) || "Type Unavailable"}
          </h5>
        </div>
        <div className="mt-3 min-h-7 overflow-hidden whitespace-nowrap">
          {Array.isArray(slider.additional?.tags) &&
            slider.additional.tags.slice(0, 6).map((tagItem) => (
              <Tag key={tagItem} color="yellow" className="mb-0">
                {tagItem}
              </Tag>
            ))}
          {Array.isArray(slider.additional?.tags) &&
            slider.additional.tags.length > 6 && (
              <Tag key="more" color="green" className="mb-0">
                ...
              </Tag>
            )}
        </div>
      </div>
    </Card>
  );
};

export default CardSlider;
