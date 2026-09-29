import React from "react";
import { Drawer, Tag, Badge, Space, Empty } from "antd";
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

const InfoRow = ({ label, children }) => (
  <div className="min-w-0">
    <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
      {label}
    </dt>
    <dd className="mt-1 break-words text-sm font-medium text-gray-800">
      {children}
    </dd>
  </div>
);

const SliderPreviewModal = ({ visible, slider, onClose }) => {
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
      rootClassName="media-preview-drawer org-form-drawer"
      title={
        <div className="flex items-center gap-2 flex-wrap pr-2">
          <Badge count={`ID-${slider.id}`} style={idBadgeStyle} />
          <span className="text-lg font-semibold">
            {slider.title_en || "Untitled Slider"}
          </span>
          <Tag color="blue">{capitalize(slider.type || "image")}</Tag>
        </div>
      }
    >
      <div className="space-y-4 pb-6">
        <div
          style={{
            border: "1px solid #e8eef5",
            borderRadius: 12,
            padding: 16,
            background: "#ffffff",
          }}
        >
          <div className="overflow-hidden rounded-lg">
            <SliderRenderer
              sliderData={slider}
              config={{ autoplay: true, dots: true }}
            />
          </div>
        </div>

        <div
          style={{
            border: "1px solid #e8eef5",
            borderRadius: 12,
            padding: 16,
            background: "#ffffff",
          }}
        >
          <dl className="grid gap-4 sm:grid-cols-2">
            <InfoRow label="Title (EN)">{slider.title_en || "—"}</InfoRow>
            <InfoRow label="Title (BN)">{slider.title_bn || "—"}</InfoRow>
            <InfoRow label="Type">
              {capitalize(slider.type || "image")}
            </InfoRow>
            <InfoRow label="Status">
              {Number(slider.status) === 1 ? (
                <Tag color="green">Active</Tag>
              ) : (
                <Tag color="default">Inactive</Tag>
              )}
            </InfoRow>
            <InfoRow label="Description (EN)">
              <div
                dangerouslySetInnerHTML={{
                  __html: slider.description_en || "—",
                }}
              />
            </InfoRow>
            <InfoRow label="Media / Cards">
              {type === "card"
                ? `${cards.length} ${cards.length === 1 ? "card" : "cards"}`
                : `${medias.length} ${medias.length === 1 ? "media item" : "media items"}`}
            </InfoRow>
            <InfoRow label="Tags">
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
            </InfoRow>
          </dl>
        </div>

        {type !== "card" && medias.length > 0 && (
          <div
            style={{
              border: "1px solid #e8eef5",
              borderRadius: 12,
              padding: 16,
              background: "#ffffff",
            }}
          >
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
