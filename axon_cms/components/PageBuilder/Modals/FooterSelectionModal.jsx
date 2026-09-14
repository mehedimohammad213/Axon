// components/PageBuilder/Modals/FooterSelectionModal.jsx

import React, { useState, useEffect } from "react";
import {
  Drawer,
  Button,
  Image,
  Typography,
  message,
  Space,
  Tooltip,
  Modal,
  Spin,
} from "antd";
import { CheckCircleOutlined, EyeOutlined } from "@ant-design/icons";
import instance from "../../../axios";
import ComponentRenderer from "../Components/ComponentRenderer";

const { Paragraph, Text } = Typography;

const isFooterPage = (page) => {
  if (!page) return false;
  if (page.type === "Footer") return true;
  const additional = Array.isArray(page.additional) ? page.additional[0] : page.additional;
  return additional?.pageType === "Footer";
};

const FooterSelectionModal = ({ isVisible, onClose, onSelectFooter }) => {
  const [footerList, setFooterList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectingId, setSelectingId] = useState(null);
  const [selectedFooter, setSelectedFooter] = useState(null);
  const [previewFooter, setPreviewFooter] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const fetchFooters = async () => {
      setLoading(true);
      try {
        let response;
        try {
          response = await instance.get("/pages?type=Footer");
        } catch {
          response = await instance.get("/pages");
        }

        const pages = Array.isArray(response.data) ? response.data : [];
        const footers = pages.filter(isFooterPage);
        setFooterList(footers);
      } catch (error) {
        console.error("Failed to fetch footers:", error);
        message.error("Failed to fetch footers");
        setFooterList([]);
      }
      setLoading(false);
    };

    fetchFooters();
  }, [isVisible]);

  const resolveFullFooter = async (footer) => {
    if (footer?.body?.[0]?.data) {
      return footer;
    }

    try {
      const response = await instance.get(`/pages/${footer.id}`);
      return response.data || footer;
    } catch (error) {
      console.error("Failed to load footer details:", error);
      return footer;
    }
  };

  const handleSelect = async (footer) => {
    setSelectingId(footer.id);
    try {
      const fullFooter = await resolveFullFooter(footer);
      setSelectedFooter(fullFooter);
      onSelectFooter(fullFooter);
    } finally {
      setSelectingId(null);
    }
  };

  const handlePreview = async (footer) => {
    setSelectingId(footer.id);
    try {
      const fullFooter = await resolveFullFooter(footer);
      setPreviewFooter(fullFooter);
      setShowPreview(true);
    } finally {
      setSelectingId(null);
    }
  };

  const renderFooterPreview = (footer) => {
    if (!footer?.body?.[0]?.data?.length) {
      return (
        <Paragraph type="secondary">
          {footer?.page_name_en || "Footer"} has no content yet.
        </Paragraph>
      );
    }

    return (
      <div className="space-y-4">
        {footer.body[0].data.map((component, index) => (
          <ComponentRenderer
            key={component._id || index}
            component={component}
            index={index}
            sectionIndex={0}
            preview={true}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Drawer
        title="Select Footer"
        placement="right"
        onClose={onClose}
        open={isVisible}
        width={800}
        extra={
          <Space>
            <Button className="headlesscancelbutton" onClick={onClose}>
              Cancel
            </Button>
          </Space>
        }
      >
        <Spin spinning={loading || Boolean(selectingId)}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {footerList.map((footer) => (
                <div
                  key={footer.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedFooter?.id === footer.id
                      ? "border-theme bg-theme/5"
                      : "hover:border-theme/50"
                  }`}
                  onClick={() => handleSelect(footer)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Text strong className="text-lg">
                      {footer.page_name_en || footer.title || `Footer #${footer.id}`}
                    </Text>
                    <Space>
                      {selectedFooter?.id === footer.id && (
                        <CheckCircleOutlined className="text-theme text-xl" />
                      )}
                      <Tooltip title="Preview">
                        <Button
                          icon={<EyeOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreview(footer);
                          }}
                          className="headlessbutton"
                        />
                      </Tooltip>
                    </Space>
                  </div>

                  {footer.logo && (
                    <div className="relative w-full aspect-video mb-4">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_MEDIA_URL}/${footer.logo.file_path}`}
                        alt={footer.page_name_en}
                        fill
                        className="object-contain rounded-md"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {footerList.length === 0 && !loading && (
              <div className="text-center py-8">
                <Paragraph type="secondary">
                  No footers available. Please create a footer first.
                </Paragraph>
              </div>
            )}
          </div>
        </Spin>
      </Drawer>

      <Modal
        title={`Preview: ${previewFooter?.page_name_en || "Footer"}`}
        open={showPreview}
        onCancel={() => setShowPreview(false)}
        footer={null}
        width={800}
        className="footer-preview-modal"
      >
        <div className="p-4 bg-gray-50 rounded-lg">
          {previewFooter && renderFooterPreview(previewFooter)}
        </div>
      </Modal>
    </>
  );
};

export default FooterSelectionModal;
