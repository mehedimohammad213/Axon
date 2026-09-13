// components/PageBuilder/PageEditForm.jsx

import React, { useState, useEffect } from "react";
import { Button, Input, Radio, Select, message } from "antd";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  PlusCircleOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import MediaSelectionModal from "./Modals/MediaSelectionModal";
import RichTextEditor from "../RichTextEditor";

const { Option } = Select;

const PageEditForm = ({ page, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    pageNameEn: "",
    pageNameBn: "",
    slug: "",
    pageType: "Page",
    metaTitle: "",
    metaDescription: "",
    keywords: [],
    metaImage: "",
    metaImageAlt: "",
    type: "Page", // This will mirror 'pageType'
  });

  const [isModalVisible, setIsModalVisible] = useState(false);

  // Initialize form data when the 'page' prop changes
  useEffect(() => {
    if (page) {
      const additional = page.additional && page.additional[0];
      const initialPageType = additional?.pageType || "Page";

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
        type: initialPageType,
      });
    }
  }, [page]);

  // Generic handler for input changes
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      // If 'pageType' changes, also update 'type' to mirror it
      ...(field === "pageType" ? { type: value } : {}),
    }));
  };

  // Handle form submission
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

    // Basic validation
    if (pageNameEn.trim() === "" || slug.trim() === "") {
      message.error("Page name and slug cannot be empty.");
      return;
    }

    // Validate slug format (only lowercase letters, numbers, and hyphens)
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      message.error(
        "Invalid slug format. Use only lowercase letters, numbers, and hyphens."
      );
      return;
    }

    // Prepare the payload
    const payload = {
      id: page.id,
      pageNameEn,
      pageNameBn,
      slug,
      pageType,
      type,
      metaTitle,
      metaDescription,
      keywords,
      metaImage,
      metaImageAlt,
    };

    // Submit the form data
    onSubmit(payload);
  };

  // Handle media selection from the modal
  const handleSelectMedia = (media) => {
    setFormData((prev) => ({
      ...prev,
      metaImage: media.file_path,
    }));
    setIsModalVisible(false);
  };

  return (
    <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      {/* Page Name EN */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-slate-700">
          Page Name (EN)
        </label>
        <Input
          value={formData.pageNameEn}
          onChange={(e) => handleChange("pageNameEn", e.target.value)}
          placeholder="Enter English Page Name"
          allowClear
          size="large"
        />
      </div>

      {/* Page Name Alt */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-slate-700">
          Page Name (Alt)
        </label>
        <Input
          value={formData.pageNameBn}
          onChange={(e) => handleChange("pageNameBn", e.target.value)}
          placeholder="Enter alternate page name"
          allowClear
          size="large"
        />
      </div>

      {/* Page Slug */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-slate-700">Page Slug</label>
        <Input
          value={formData.slug}
          onChange={(e) => handleChange("slug", e.target.value)}
          placeholder="e.g., about-us"
          allowClear
          size="large"
        />
        <span className="text-xs text-slate-500">
          Use only lowercase letters, numbers, and hyphens.
        </span>
      </div>

      {/* Page Type */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-slate-700">Page Type</label>
        <Radio.Group
          onChange={(e) => handleChange("pageType", e.target.value)}
          value={formData.pageType}
          size="large"
        >
          <Radio value="Page">Page</Radio>
        </Radio.Group>
      </div>

      {/* Page Meta */}
      <div className="flex flex-col gap-4 border-t border-slate-100 pt-4">
        <label className="text-sm font-semibold text-slate-700">
          Page Meta Title
        </label>
        <Input
          value={formData.metaTitle}
          onChange={(e) => handleChange("metaTitle", e.target.value)}
          placeholder="Enter Meta Title"
          allowClear
          size="large"
        />

        <label className="text-sm font-semibold text-slate-700">
          Page Meta Description
        </label>
        <RichTextEditor
          defaultValue={formData.metaDescription}
          onChange={(html) => handleChange("metaDescription", html)}
          editMode={true}
          maxLength={500}
        />

        <label className="text-sm font-semibold text-slate-700">
          Page Meta Keywords
        </label>
        <Select
          mode="tags"
          value={formData.keywords}
          onChange={(value) => handleChange("keywords", value)}
          placeholder="Enter Meta Keywords"
          allowClear
          size="large"
          showSearch
        >
          {formData.keywords?.map((keyword) => (
            <Option key={keyword} value={keyword}>
              {keyword}
            </Option>
          ))}
        </Select>

        <label className="text-sm font-semibold text-slate-700">
          Page Meta Image
        </label>
        <Button
          icon={<PlusCircleOutlined />}
          onClick={() => setIsModalVisible(true)}
          className="headlessbutton !mr-0 w-fit"
        >
          Select Meta Image
        </Button>
        {formData.metaImage && (
          <div className="relative mt-2 h-32 w-32 overflow-hidden rounded-lg border border-slate-200">
            <Image
              src={`${process.env.NEXT_PUBLIC_MEDIA_URL}/${formData.metaImage}`}
              alt="Meta Image"
              layout="fill"
              objectFit="cover"
              className="rounded-md"
            />
          </div>
        )}

        <MediaSelectionModal
          isVisible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onSelectMedia={handleSelectMedia}
          selectionMode="single"
        />

        <label className="text-sm font-semibold text-slate-700">
          Page Meta Image Alt Text
        </label>
        <Input
          value={formData.metaImageAlt}
          onChange={(e) => handleChange("metaImageAlt", e.target.value)}
          placeholder="Enter Meta Image Alt Text"
          allowClear
          size="large"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        <Button
          icon={<CheckCircleFilled />}
          onClick={handleSubmit}
          className="headlessbutton !mr-0"
          type="primary"
        >
          Save Changes
        </Button>
        <Button
          icon={<CloseCircleFilled />}
          onClick={onCancel}
          className="headlesscancelbutton !mr-0"
        >
          Discard
        </Button>
      </div>
    </div>
  );
};

export default PageEditForm;
