// components/PageBuilder/PageEditForm.jsx

import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Button, Input, Radio, Select, message } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import Image from "next/image";
import MediaSelectionModal from "./Modals/MediaSelectionModal";
import RichTextEditor from "../RichTextEditor";

const { Option } = Select;

const PageEditForm = forwardRef(({ page, onSubmit }, ref) => {
  const isFooter = (page?.type || "").toLowerCase() === "footer";

  const [formData, setFormData] = useState({
    pageNameEn: "",
    pageNameBn: "",
    slug: "",
    pageType: isFooter ? "Footer" : "Page",
    metaTitle: "",
    metaDescription: "",
    keywords: [],
    metaImage: "",
    metaImageAlt: "",
    type: isFooter ? "Footer" : "Page",
  });

  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    if (page) {
      const additional = page.additional && page.additional[0];
      const initialPageType =
        additional?.pageType || page.type || (isFooter ? "Footer" : "Page");

      setFormData({
        pageNameEn: page.page_name_en || "",
        pageNameBn: page.page_name_bn || "",
        slug: page.slug || "",
        pageType: initialPageType,
        metaTitle: additional?.metaTitle || "",
        metaDescription: additional?.metaDescription || "",
        keywords: additional?.keywords || [],
        metaImage: additional?.metaImage || "",
        metaImageAlt: additional?.metaImageAlt || "",
        type: page.type || initialPageType,
      });
    }
  }, [page, isFooter]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "pageType" ? { type: value } : {}),
    }));
  };

  const handleSubmit = () => {
    const {
      pageNameEn,
      slug,
      pageType,
      metaTitle,
      metaDescription,
      keywords,
      metaImage,
      metaImageAlt,
      type,
      pageNameBn,
    } = formData;

    if (pageNameEn.trim() === "") {
      message.error(`${isFooter ? "Footer" : "Page"} name cannot be empty.`);
      return;
    }

    if (!isFooter) {
      if (slug.trim() === "") {
        message.error("Page name and slug cannot be empty.");
        return;
      }
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(slug)) {
        message.error(
          "Invalid slug format. Use only lowercase letters, numbers, and hyphens."
        );
        return;
      }
    }

    onSubmit({
      id: page.id,
      pageNameEn,
      pageNameBn,
      slug: isFooter ? slug || null : slug,
      pageType,
      type,
      metaTitle,
      metaDescription,
      keywords,
      metaImage,
      metaImageAlt,
    });
  };

  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
  }));

  const handleSelectMedia = (media) => {
    setFormData((prev) => ({
      ...prev,
      metaImage: media.file_path,
    }));
    setIsModalVisible(false);
  };

  const entityLabel = isFooter ? "Footer" : "Page";

  return (
    <div className="space-y-4">
      <div
        style={{
          border: "1px solid #e8eef5",
          borderRadius: 12,
          padding: 16,
          background: "#ffffff",
        }}
      >
        <div className="grid gap-x-4 md:grid-cols-2">
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              {entityLabel} Name (EN)
            </label>
            <Input
              value={formData.pageNameEn}
              onChange={(e) => handleChange("pageNameEn", e.target.value)}
              placeholder={`Enter English ${entityLabel} Name`}
              allowClear
            />
          </div>
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              {entityLabel} Name (Alt)
            </label>
            <Input
              value={formData.pageNameBn}
              onChange={(e) => handleChange("pageNameBn", e.target.value)}
              placeholder={`Enter alternate ${entityLabel.toLowerCase()} name`}
              allowClear
            />
          </div>
        </div>

        {!isFooter && (
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Page Slug
            </label>
            <Input
              value={formData.slug}
              onChange={(e) => handleChange("slug", e.target.value)}
              placeholder="e.g., about-us"
              allowClear
            />
            <span className="mt-1 block text-xs text-gray-500">
              Use only lowercase letters, numbers, and hyphens.
            </span>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            {entityLabel} Type
          </label>
          <Radio.Group
            onChange={(e) => handleChange("pageType", e.target.value)}
            value={formData.pageType}
          >
            {isFooter ? (
              <Radio value="Footer">Footer</Radio>
            ) : (
              <Radio value="Page">Page</Radio>
            )}
          </Radio.Group>
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
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Meta Title
          </label>
          <Input
            value={formData.metaTitle}
            onChange={(e) => handleChange("metaTitle", e.target.value)}
            placeholder="Enter Meta Title"
            allowClear
          />
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Meta Description
          </label>
          <RichTextEditor
            defaultValue={formData.metaDescription}
            onChange={(html) => handleChange("metaDescription", html)}
            editMode={true}
            maxLength={500}
          />
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Meta Keywords
          </label>
          <Select
            mode="tags"
            value={formData.keywords}
            onChange={(value) => handleChange("keywords", value)}
            placeholder="Enter Meta Keywords"
            allowClear
            showSearch
            className="w-full"
          >
            {formData.keywords?.map((keyword) => (
              <Option key={keyword} value={keyword}>
                {keyword}
              </Option>
            ))}
          </Select>
        </div>

        <div className="grid gap-x-4 md:grid-cols-2">
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Meta Image
            </label>
            <Button
              icon={<PlusCircleOutlined />}
              onClick={() => setIsModalVisible(true)}
              className="headlessbutton headlessbutton-pill !mr-0"
            >
              Select Meta Image
            </Button>
            {formData.metaImage && (
              <div className="relative mt-3 h-28 w-28 overflow-hidden rounded-lg border border-gray-200">
                <Image
                  src={`${process.env.NEXT_PUBLIC_MEDIA_URL}/${formData.metaImage}`}
                  alt="Meta Image"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-md"
                />
              </div>
            )}
          </div>
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Meta Image Alt Text
            </label>
            <Input
              value={formData.metaImageAlt}
              onChange={(e) => handleChange("metaImageAlt", e.target.value)}
              placeholder="Enter Meta Image Alt Text"
              allowClear
            />
          </div>
        </div>

        <MediaSelectionModal
          isVisible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onSelectMedia={handleSelectMedia}
          selectionMode="single"
        />
      </div>
    </div>
  );
});

PageEditForm.displayName = "PageEditForm";

export default PageEditForm;
