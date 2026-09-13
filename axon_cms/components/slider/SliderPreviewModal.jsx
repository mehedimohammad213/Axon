import React from "react";
import { Drawer, Button, Tag, Badge, Space, Descriptions, Empty } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { capitalize } from "lodash";
import SliderRenderer from "../PageBuilder/Components/SliderComponent/SliderRenderer";
import { orderByIds } from "./SliderForm/orderByIds";
import { resolveMediaUrl } from "../../utils/mediaUrl";
import Image from "next/image";

const idBadgeStyle = {
  backgroundColor: "#f0f0f0",
  color: "#666",
  fontSize: "12px",
  fontWeight: "500",
};

const SliderPreviewModal = ({
  visible,
  slider,
  onClose,
  onEdit,
}) => {
  if (!slider) return null;

  const type = (slider.type || "image").toLowerCase();
  const tags = Array.isArray(slider.additional?.tags)
    ? slider.additional.tags
    : [];
  const medias = orderByIds(slider.medias || [], slider.media_ids || []);
  const cards = orderByIds(slider.cards || [], slider.card_ids || []);

  return (
    <Drawer
      open={visible}
      onClose={onClose}
      placement="right"
      width="50%"
      destroyOnClose
      title={
        <div className="flex items-center gap-2 flex-wrap pr-2">
          <Badge count={`ID-${slider.id}`} style={idBadgeStyle} />
          <span className="text-lg font-semibold">
            {slider.title_en || "Untitled Slider"}
          </span>
          <Tag color="blue">{capitalize(slider.type || "image")}</Tag>
        </div>
      }
      extra={
        <Button
          type="primary"
          icon={<EditOutlined />}
          className="headlessbutton"
          onClick={() => {
            onClose();
            onEdit?.(slider.id);
          }}
        >
          Edit Slider
        </Button>
      }
    >
      <div className="space-y-6 pb-6">
        <div className="rounded-xl border border-gray-200 bg-white p-3 overflow-hidden">
          <SliderRenderer
            sliderData={slider}
            config={{ autoplay: true, dots: true }}
          />
        </div>

        <Descriptions
          bordered
          size="small"
          column={1}
          labelStyle={{ width: 140, fontWeight: 600 }}
        >
          <Descriptions.Item label="Title (EN)">
            {slider.title_en || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Title (BN)">
            {slider.title_bn || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Description (EN)">
            <div
              dangerouslySetInnerHTML={{
                __html: slider.description_en || "—",
              }}
            />
          </Descriptions.Item>
          <Descriptions.Item label="Type">
            {capitalize(slider.type || "image")}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            {Number(slider.status) === 1 ? (
              <Tag color="green">Active</Tag>
            ) : (
              <Tag color="default">Inactive</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Tags">
            {tags.length ? (
              <Space wrap size={[4, 4]}>
                {tags.map((tag) => (
                  <Tag key={tag} color="gold">
                    {tag}
                  </Tag>
                ))}
              </Space>
            ) : (
              "—"
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Media / Cards">
            {type === "card"
              ? `${cards.length} card(s)`
              : `${medias.length} media item(s)`}
          </Descriptions.Item>
        </Descriptions>

        {type !== "card" && medias.length > 0 && (
          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-700">
              Media Items
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {medias.map((media) => (
                <div
                  key={media.id}
                  className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                >
                  <Image
                    src={resolveMediaUrl(media.file_path)}
                    alt={media.title || media.file_name || "Media"}
                    width={200}
                    height={120}
                    className="h-24 w-full object-cover"
                    unoptimized
                  />
                  <div className="truncate px-2 py-1 text-xs text-gray-500">
                    {media.file_name || media.title || `ID-${media.id}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {type === "card" && cards.length === 0 && (
          <Empty description="No cards linked to this slider" />
        )}
        {type !== "card" && medias.length === 0 && (
          <Empty description="No media linked to this slider" />
        )}
      </div>
    </Drawer>
  );
};

export default SliderPreviewModal;
