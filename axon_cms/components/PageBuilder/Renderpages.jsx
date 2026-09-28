// components/PageBuilder/RenderPages.jsx

import React from "react";
import { Empty, Button } from "antd";
import { FileTextOutlined, PlusOutlined } from "@ant-design/icons";
import PageCard from "./PageCard";

const RenderPages = ({
  webpages = [],
  handlePreviewPage,
  handleDeletePage,
  handleEditPageInfo,
  handleDuplicatePage,
  onCreate,
  emptyTitle = "No pages yet",
  emptyDescription = "Create a page to start building your site content.",
  createLabel = "Create page",
}) => {
  if (!webpages.length) {
    return (
      <div className="mt-6 flex items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16">
        <Empty
          image={
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-2xl text-brand-dark">
              <FileTextOutlined />
            </div>
          }
          description={
            <div className="space-y-1">
              <p className="text-base font-medium text-gray-800">{emptyTitle}</p>
              <p className="text-sm text-gray-500">{emptyDescription}</p>
            </div>
          }
        >
          {onCreate && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onCreate}
              className="headlessbutton headlessbutton-pill !mr-0 mt-2"
            >
              {createLabel}
            </Button>
          )}
        </Empty>
      </div>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
      {webpages.map((page) => (
        <PageCard
          key={page.id}
          page={page}
          handlePreviewPage={handlePreviewPage}
          handleDeletePage={handleDeletePage}
          handleEditPageInfo={handleEditPageInfo}
          handleDuplicatePage={handleDuplicatePage}
        />
      ))}
    </div>
  );
};

export default RenderPages;
