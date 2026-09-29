// components/cards/CardsList.jsx

import React from "react";
import { List } from "antd";
import CardItem from "./CardItem";

const CardsList = ({
  cards,
  viewType,
  media,
  pages,
  onDeleteCard,
  onPreviewCard,
  onEditCard,
}) => {
  return (
    <div className="media-content-card">
      {viewType === "list" ? (
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
      ) : (
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
      )}
    </div>
  );
};

export default CardsList;
