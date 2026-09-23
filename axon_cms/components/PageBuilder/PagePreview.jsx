// components/PageBuilder/PagePreview.jsx

import React, { useState, useEffect } from "react";
import { Typography, Spin, message, Modal, Tag } from "antd";
import { ArrowLeftOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import instance from "../../axios";
import ComponentRenderer from "./Components/ComponentRenderer";
import syncPageLinkedData from "./utils/syncPageLinkedData";
import { getPageListPath } from "./utils/getPageListPath";

const { Title, Text } = Typography;

const SectionBlock = ({ section, sectionIndex }) => {
  const hasComponents = section.data && section.data.length > 0;
  const title =
    section.title ||
    section.sectionTitle ||
    `Section ${sectionIndex + 1}`;

  return (
    <section className="mb-6 last:mb-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-3">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold tracking-wide text-slate-800">
            {title}
          </h2>
          {hasComponents && (
            <p className="mt-0.5 text-xs text-slate-500">
              {section.data.length} block{section.data.length === 1 ? "" : "s"}
            </p>
          )}
        </div>
        <Tag className="m-0 border-slate-200 bg-white text-slate-600">
          Preview
        </Tag>
      </div>

      <div className="space-y-3 p-4 sm:p-5">
        {hasComponents ? (
          section.data.map((component, compIndex) => (
            <div
              key={component?._id || compIndex}
              className="overflow-hidden rounded-lg border border-slate-100 bg-slate-50/40"
            >
              <ComponentRenderer
                component={component}
                index={compIndex}
                components={section.data}
                sectionIndex={sectionIndex}
                preview={true}
              />
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
            <Text type="secondary">No components in this section.</Text>
          </div>
        )}
      </div>
    </section>
  );
};

const PreviewBody = ({ pageData }) => {
  if (!pageData?.body?.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
        <Text type="secondary">No sections available for preview.</Text>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {pageData.body.map((section, sectionIndex) => (
        <SectionBlock
          key={section._id || sectionIndex}
          section={section}
          sectionIndex={sectionIndex}
        />
      ))}
    </div>
  );
};

const PagePreview = ({ pageId, pageData: propPageData, open, setOpen }) => {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const finalPageData = propPageData || pageData;

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true);
        const response = await instance.get(`/pages/${pageId}`);
        const syncedData = await syncPageLinkedData(response.data, async () => {
          const formsResponse = await instance.get("/form_builder");
          return formsResponse.data;
        });
        setPageData(syncedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching page data:", error);
        message.error("Failed to load page preview");
        setLoading(false);
      }
    };

    if (pageId && !propPageData) {
      fetchPageData();
    } else if (propPageData) {
      setLoading(false);
    }
  }, [pageId, propPageData]);

  const handleBack = () => {
    router.push(getPageListPath(finalPageData));
  };

  const handleEditPage = () => {
    router.push(`/page-builder/${pageId}?edit=true`);
  };

  if (open !== undefined) {
    if (loading) {
      return (
        <Modal
          title="Page Preview"
          open={open}
          onCancel={() => setOpen(false)}
          footer={null}
          width="90%"
          style={{ top: 20 }}
        >
          <div className="flex h-64 items-center justify-center">
            <Spin size="large" />
          </div>
        </Modal>
      );
    }

    if (!finalPageData) {
      return (
        <Modal
          title="Page Preview"
          open={open}
          onCancel={() => setOpen(false)}
          footer={null}
          width="90%"
          style={{ top: 20 }}
        >
          <div className="flex h-64 items-center justify-center">
            <Text>Page not found</Text>
          </div>
        </Modal>
      );
    }

    return (
      <Modal
        title={`Preview: ${finalPageData.page_name_en || "Page Preview"}`}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width="90%"
        style={{ top: 20 }}
        bodyStyle={{ maxHeight: "80vh", overflow: "auto", background: "#f8fafc" }}
      >
        <div className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8">
          <PreviewBody pageData={finalPageData} />
        </div>
      </Modal>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Spin size="large" />
      </div>
    );
  }

  if (!finalPageData) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Text>Page not found</Text>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-slate-100/90 py-4 backdrop-blur">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 overflow-hidden rounded-xl border border-slate-200 bg-white px-5 py-3.5 shadow-sm sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="shrink-0 rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
                aria-label="Back to pages"
              >
                <ArrowLeftOutlined />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <EyeOutlined className="shrink-0 text-slate-400" />
                  <Title level={4} className="!mb-0 truncate !text-slate-900">
                    {finalPageData.page_name_en || "Page Preview"}
                  </Title>
                </div>
                <p className="text-xs text-slate-500">
                  Read-only preview · content colors adjusted for readability
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleEditPage}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
            >
              <EditOutlined />
              Edit Page
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <PreviewBody pageData={finalPageData} />
      </main>
    </div>
  );
};

export default PagePreview;
