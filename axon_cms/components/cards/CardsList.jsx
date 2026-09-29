// components/cards/CardsList.jsx

import React, { useMemo } from "react";
import { List, Tabs } from "antd";
import { AppstoreOutlined, UnorderedListOutlined } from "@ant-design/icons";
import CardItem from "./CardItem";

const TabLabel = ({ icon, label, count }) => (
  <span className="media-tab-label">
    <span className="media-tab-icon">{icon}</span>
    <span className="media-tab-text">{label}</span>
    {typeof count === "number" && (
      <span className="media-tab-count">{count}</span>
    )}
  </span>
);

const CardsList = ({
  cards,
  viewType,
  media,
  pages,
  onDeleteCard,
  onPreviewCard,
  onEditCard,
  onViewTypeChange,
}) => {
  const count = cards?.length || 0;

  const gridContent = (
    <div className="grid min-w-0 grid-cols-1 items-stretch gap-4 [&>*]:min-w-0 md:grid-cols-2 xl:grid-cols-3">
      {cards?.map((card) => (
        <CardItem
          key={card.id}
          card={card}
          media={media}
          pages={pages}
          viewType="grid"
          onDeleteCard={onDeleteCard}
          onPreviewCard={onPreviewCard}
          onEditCard={onEditCard}
        />
      ))}
    </div>
  );

  const listContent = (
    <List
      itemLayout="horizontal"
      dataSource={cards}
      renderItem={(card) => (
        <CardItem
          key={card.id}
          card={card}
          media={media}
          pages={pages}
          viewType="list"
          onDeleteCard={onDeleteCard}
          onPreviewCard={onPreviewCard}
          onEditCard={onEditCard}
        />
      )}
    />
  );

  const items = useMemo(
    () => [
      {
        key: "grid",
        label: (
          <TabLabel
            icon={<AppstoreOutlined />}
            label="Grid"
            count={count}
          />
        ),
        children: gridContent,
      },
      {
        key: "list",
        label: (
          <TabLabel
            icon={<UnorderedListOutlined />}
            label="List"
            count={count}
          />
        ),
        children: listContent,
      },
    ],
    [cards, media, pages, count, onDeleteCard, onPreviewCard, onEditCard]
  );

  return (
    <Tabs
      activeKey={viewType || "grid"}
      onChange={(key) => onViewTypeChange?.(key)}
      animated
      items={items}
      className="media-filter-tabs min-w-0"
    />
  );
};

export default CardsList;
