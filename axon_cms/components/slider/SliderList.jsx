import React, { useState, useEffect } from "react";
import { Empty, Pagination, Tabs } from "antd";
import { PlayCircleOutlined } from "@ant-design/icons";
import ImageSlider from "./ImageSlider";
import CardSlider from "./CardSlider";

const SliderList = ({
  imageSliders = [],
  cardSliders = [],
  CustomNextArrow,
  CustomPrevArrow,
  MEDIA_URL,
  handlePreviewClick,
  handleEditClick,
  handleDeleteSlider,
  itemsPerPage = 10,
}) => {
  const [imageCurrentPage, setImageCurrentPage] = useState(1);
  const [cardCurrentPage, setCardCurrentPage] = useState(1);

  useEffect(() => {
    setImageCurrentPage(1);
    setCardCurrentPage(1);
  }, [itemsPerPage, imageSliders.length, cardSliders.length]);

  const paginatedImageSliders = imageSliders.slice(
    (imageCurrentPage - 1) * itemsPerPage,
    imageCurrentPage * itemsPerPage
  );

  const paginatedCardSliders = cardSliders.slice(
    (cardCurrentPage - 1) * itemsPerPage,
    cardCurrentPage * itemsPerPage
  );

  const renderPagination = (current, total, onChange) =>
    total > itemsPerPage ? (
      <div className="mt-4 flex justify-center">
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <Pagination
            current={current}
            pageSize={itemsPerPage}
            total={total}
            onChange={onChange}
            showSizeChanger={false}
            className="[&_.ant-pagination-item-active]:border-brand [&_.ant-pagination-item-active_a]:text-brand-dark"
          />
        </div>
      </div>
    ) : null;

  const renderEmpty = (label) => (
    <div className="flex items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16">
      <Empty
        image={
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-2xl text-brand-dark">
            <PlayCircleOutlined />
          </div>
        }
        description={
          <div className="space-y-1">
            <p className="text-base font-medium text-gray-800">No {label} found</p>
            <p className="text-sm text-gray-500">
              Create a slider or adjust your filters.
            </p>
          </div>
        }
      />
    </div>
  );

  return (
    <Tabs
      defaultActiveKey="1"
      className="[&_.ant-tabs-nav]:mb-4"
      items={[
        {
          key: "1",
          label: `Image Sliders (${imageSliders.length})`,
          children: paginatedImageSliders.length ? (
            <>
              <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
                {paginatedImageSliders.map((slider) => (
                  <ImageSlider
                    key={slider.id}
                    slider={slider}
                    CustomNextArrow={CustomNextArrow}
                    CustomPrevArrow={CustomPrevArrow}
                    MEDIA_URL={MEDIA_URL}
                    handlePreviewClick={handlePreviewClick}
                    handleEditClick={handleEditClick}
                    handleDeleteSlider={handleDeleteSlider}
                  />
                ))}
              </div>
              {renderPagination(imageCurrentPage, imageSliders.length, (page) =>
                setImageCurrentPage(page)
              )}
            </>
          ) : (
            renderEmpty("image sliders")
          ),
        },
        {
          key: "2",
          label: `Card Sliders (${cardSliders.length})`,
          children: paginatedCardSliders.length ? (
            <>
              <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
                {paginatedCardSliders.map((slider) => (
                  <CardSlider
                    key={slider.id}
                    slider={slider}
                    CustomNextArrow={CustomNextArrow}
                    CustomPrevArrow={CustomPrevArrow}
                    MEDIA_URL={MEDIA_URL}
                    handlePreviewClick={handlePreviewClick}
                    handleEditClick={handleEditClick}
                    handleDeleteSlider={handleDeleteSlider}
                  />
                ))}
              </div>
              {renderPagination(cardCurrentPage, cardSliders.length, (page) =>
                setCardCurrentPage(page)
              )}
            </>
          ) : (
            renderEmpty("card sliders")
          ),
        },
      ]}
    />
  );
};

export default SliderList;
