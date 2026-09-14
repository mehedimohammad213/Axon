// components/PageBuilder/Components/CardComponent.jsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Button,
  Modal,
  Typography,
  message,
  Popconfirm,
  Space,
  Tooltip,
  Drawer,
  Switch,
  Collapse,
  Input,
} from "antd";
import RichTextEditor from "../../RichTextEditor";
import {
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  ExportOutlined,
  CopyFilled,
  DragOutlined,
  SettingOutlined,
  ReloadOutlined,
  GlobalOutlined,
} from "@ant-design/icons";

const { Panel } = Collapse;
import CardSelectionModal from "../Modals/CardSelectionModal";
import ComponentEditButton from "./components/ComponentEditButton";
import ComponentDuplicateButton from "./components/ComponentDuplicateButton";
import ComponentDeleteButton from "./components/ComponentDeleteButton";
import Image from "next/image";
import instance from "../../../axios";
import { useRouter } from "next/router";

const { Text } = Typography;

// Configuration
const POLLING_INTERVAL = 30000; // 30 seconds

const hasSelectedCard = (card) =>
  Boolean(
    card?.id ||
      card?.title_en ||
      card?.title_bn ||
      card?.media_files?.file_path
  );

// Helper function to render card media
const renderCardMedia = (media, altTitle = "Card Image", compact = false) => {
  if (!media || !media.file_path) {
    return (
      <div
        className={`flex w-full ${compact ? "h-36" : "h-48"} items-center justify-center rounded-t-lg bg-slate-100`}
      >
        <div className="px-4 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-500">
            C
          </div>
          <p className="text-xs text-slate-500">No image attached</p>
        </div>
      </div>
    );
  }
  return (
    <div className={`w-full overflow-hidden ${compact ? "max-h-40" : ""}`}>
      <Image
        src={`${process.env.NEXT_PUBLIC_MEDIA_URL}/${media.file_path}`}
        alt={altTitle}
        width={900}
        height={compact ? 280 : 400}
        objectFit="cover"
        className="w-full rounded-t-lg"
        priority
      />
    </div>
  );
};

// Helper function to get display content based on language preference
const getDisplayContent = (cardData, showAltContent = false) => {
  if (!cardData)
    return { title: "Untitled Card", description: "No description available" };

  if (showAltContent) {
    return {
      title: cardData.title_bn || cardData.title_en || "Untitled Card",
      description:
        cardData.description_bn ||
        cardData.description_en ||
        "No description available",
    };
  }

  return {
    title: cardData.title_en || "Untitled Card",
    description: cardData.description_en || "No description available",
  };
};

const CardComponent = ({
  component,
  updateComponent,
  deleteComponent,
  preview = false,
  isEditing = false,
  onDuplicateElement,
}) => {
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [cardData, setCardData] = useState(
    hasSelectedCard(component._headless) ? component._headless : null
  );
  const [selectedCardData, setSelectedCardData] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoPolling, setAutoPolling] = useState(false); // Always false
  const [showAltContent, setShowAltContent] = useState(
    hasSelectedCard(component._headless)
      ? component._headless?.showAltContent || false
      : false
  );
  const [isEditingState, setIsEditingState] = useState(false);
  const [isEditingAltContent, setIsEditingAltContent] = useState(false);
  const [altContentData, setAltContentData] = useState({
    altTitle: hasSelectedCard(component._headless)
      ? component._headless?.altTitle || ""
      : "",
    altDescription: hasSelectedCard(component._headless)
      ? component._headless?.altDescription || ""
      : "",
  });
  const lastUpdateRef = useRef(null);

  // Check if we're in page-builder context
  const isInPageBuilder = router.pathname.includes("/page-builder");
  const isInPagePreview = router.pathname.includes("/page-preview");
  const cardSelected = hasSelectedCard(cardData);

  // Synchronize cardData with component._headless when it changes
  useEffect(() => {
    if (hasSelectedCard(component._headless)) {
      setCardData(component._headless);
      setShowAltContent(component._headless?.showAltContent || false);
      setAltContentData({
        altTitle: component._headless?.altTitle || "",
        altDescription: component._headless?.altDescription || "",
      });
    } else if (!isEditingState) {
      setCardData(null);
      setShowAltContent(false);
      setAltContentData({ altTitle: "", altDescription: "" });
    }
  }, [component._headless, isEditingState]);

  // Completely disable auto-polling in all contexts
  useEffect(() => {
    // Always disable auto-polling
    setAutoPolling(false);
  }, [preview, isEditing, isInPageBuilder, isInPagePreview]);

  // Auto-refresh card data - completely disabled
  useEffect(() => {
    // Completely disable auto-refresh in all contexts
    console.log("🔄 Card auto-refresh disabled - all contexts");
    return;
  }, [
    cardData?.id,
    autoPolling,
    isEditing,
    preview,
    isInPageBuilder,
    isInPagePreview,
  ]);

  // Function to refresh card data from the server
  const refreshCardData = useCallback(
    async (silent = false) => {
      // Completely prevent updates when in page-builder context
      if (isInPageBuilder) {
        console.log("🔄 Skipping card refresh - in page-builder context");
        return;
      }

      // Prevent updates during editing to avoid losing draft state
      if (isEditing) {
        return;
      }

      // Only allow refresh in preview mode
      if (!preview) {
        return;
      }

      if (!cardData?.id) {
        if (!silent) {
          message.warning("No card ID available to refresh");
        }
        return;
      }

      // Check if we've already updated recently to prevent rapid updates
      const now = Date.now();
      if (lastUpdateRef.current && now - lastUpdateRef.current < 10000) {
        console.log("🔄 Skipping card update - too recent");
        return;
      }

      setIsRefreshing(true);
      try {
        const response = await instance.get(`/cards/${cardData.id}`);
        if (response.status === 200) {
          const updatedCard = response.data;

          // Check if there were actual changes
          const hasChanges =
            JSON.stringify(updatedCard) !== JSON.stringify(component._headless);

          if (hasChanges) {
            const updatedComponent = {
              ...component,
              _headless: {
                ...updatedCard,
                config: cardData.config || {
                  showDescription: true,
                  showImage: true,
                  layout: "horizontal",
                },
              },
              id: updatedCard.id,
            };

            updateComponent(updatedComponent);
            setCardData(updatedCard);
            setLastUpdated(new Date());
            lastUpdateRef.current = now;

            if (!silent) {
              message.success("Card data updated successfully");
            }
          } else if (!silent) {
            message.info("Card data is up to date");
          }
        }
      } catch (error) {
        console.error("Error refreshing card data:", error);
        if (!silent) {
          message.error("Failed to refresh card data");
        }
      } finally {
        setIsRefreshing(false);
      }
    },
    [
      cardData?.id,
      cardData?.config,
      component,
      updateComponent,
      isEditing,
      preview,
      isInPageBuilder,
    ]
  );

  // Handle selection from CardSelectionModal — link immediately like Slider
  const handleSelectCard = useCallback(
    (selectedCard) => {
      if (!hasSelectedCard(selectedCard)) {
        Modal.error({
          title: "Validation Error",
          content: "No card selected.",
        });
        return;
      }

      const updatedComponent = {
        ...component,
        _headless: {
          ...selectedCard,
          config: selectedCard.config || {
            showDescription: true,
            showImage: true,
            layout: "horizontal",
          },
          altTitle: altContentData.altTitle,
          altDescription: altContentData.altDescription,
          showAltContent,
        },
        id: selectedCard.id,
      };

      updateComponent(updatedComponent);
      setCardData(selectedCard);
      setSelectedCardData(null);
      setIsEditingState(false);
      setIsModalVisible(false);
      message.success("Card updated successfully.");
    },
    [component, updateComponent, altContentData, showAltContent]
  );

  // Handle Submit (Confirm) Changes — kept for alt-content save flows
  const handleSubmit = useCallback(() => {
    const cardToSave = selectedCardData || cardData;
    if (!hasSelectedCard(cardToSave)) {
      Modal.error({
        title: "Validation Error",
        content: "No card selected.",
      });
      return;
    }

    const updatedComponent = {
      ...component,
      _headless: {
        ...cardToSave,
        config: cardToSave.config || {
          showDescription: true,
          showImage: true,
          layout: "horizontal",
        },
        altTitle: altContentData.altTitle,
        altDescription: altContentData.altDescription,
        showAltContent,
      },
      id: cardToSave.id,
    };

    updateComponent(updatedComponent);
    setCardData(cardToSave);
    setSelectedCardData(null);
    setIsEditingState(false);
    message.success("Card updated successfully.");
  }, [
    selectedCardData,
    cardData,
    component,
    updateComponent,
    altContentData,
    showAltContent,
  ]);

  // Handle Cancel Changes
  const handleCancel = useCallback(() => {
    if (hasSelectedCard(component._headless)) {
      setCardData(component._headless);
    } else {
      setCardData(null);
    }
    setSelectedCardData(null);
    setIsEditingState(false);
    message.info("Card update canceled.");
  }, [component._headless]);

  // Handle Delete Component
  const handleDelete = useCallback(() => {
    deleteComponent();
  }, [deleteComponent]);

  // Handle Alternative Content Editing
  const handleEditAltContent = useCallback(() => {
    setIsEditingAltContent(true);
  }, []);

  const handleSaveAltContent = useCallback(() => {
    const updatedComponent = {
      ...component,
      _headless: {
        ...component._headless,
        altTitle: altContentData.altTitle,
        altDescription: altContentData.altDescription,
      },
    };
    updateComponent(updatedComponent);
    setIsEditingAltContent(false);
    message.success("Alternative content updated successfully.");
  }, [component, altContentData, updateComponent]);

  const handleCancelAltContent = useCallback(() => {
    setAltContentData({
      altTitle: component._headless?.altTitle || "",
      altDescription: component._headless?.altDescription || "",
    });
    setIsEditingAltContent(false);
    message.info("Alternative content editing canceled.");
  }, [component._headless]);

  // If in preview mode, render the card content only
  if (preview) {
    const displayContent = getDisplayContent(cardData, showAltContent);
    const altContent = getDisplayContent(cardData, !showAltContent);

    return (
      <div className="preview-card-component px-5 py-4">
        {cardSelected ? (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {renderCardMedia(cardData.media_files, displayContent.title, true)}
            <div className="space-y-2 p-4">
              <h3 className="text-base font-semibold text-slate-900">
                {displayContent.title}
              </h3>
              {displayContent.description ? (
                <div
                  className="prose prose-sm prose-slate max-w-none text-slate-600"
                  dangerouslySetInnerHTML={{
                    __html: displayContent.description,
                  }}
                />
              ) : null}
            </div>
            {showAltContent &&
              (cardData.title_bn ||
                cardData.description_bn ||
                altContentData.altTitle ||
                altContentData.altDescription) && (
                <div className="border-t border-slate-100 bg-slate-50 p-4">
                  <div className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                    Alternative
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    {altContentData.altTitle || altContent.title}
                  </h3>
                  <div
                    className="prose prose-sm prose-slate mt-1 max-w-none text-slate-600"
                    dangerouslySetInnerHTML={{
                      __html:
                        altContentData.altDescription ||
                        altContent.description,
                    }}
                  />
                </div>
              )}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
            <Text type="secondary">No card linked to this block.</Text>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border p-4 rounded-md bg-white">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <DragOutlined className="text-2xl border rounded-md p-1" />
          <h3 className="text-xl font-semibold">Card Component</h3>
        </div>
        <div className="flex items-center gap-2">
          <Space>
            {cardSelected && (
              <ComponentEditButton
                onClick={() => setIsModalVisible(true)}
                title="Edit card"
              />
            )}
            <ComponentDuplicateButton
              onClick={onDuplicateElement}
              title="Duplicate component"
            />
            <ComponentDeleteButton
              onConfirm={handleDelete}
              title="Delete component"
              confirmTitle="Are you sure you want to delete this component?"
            />
          </Space>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-start gap-4">
        <div className="flex flex-col w-full">
          {cardSelected ? (
            <div className="w-full relative">
              <div className="bg-white rounded-lg shadow-md overflow-hidden border border-slate-100">
                {renderCardMedia(cardData.media_files)}
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">
                    {cardData.title_en || "Untitled Card"}
                  </h3>
                  <div
                    className="text-gray-600"
                    dangerouslySetInnerHTML={{
                      __html:
                        cardData.description_en || "No description available",
                    }}
                  />
                </div>
              </div>
              {showAltContent &&
                (cardData.title_bn ||
                  cardData.description_bn ||
                  altContentData.altTitle ||
                  altContentData.altDescription) && (
                  <div className="mt-2 bg-gray-50 rounded-lg shadow-md overflow-hidden border border-slate-100">
                    {renderCardMedia(cardData.media_files)}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2 text-gray-700">
                        {altContentData.altTitle ||
                          cardData.title_bn ||
                          cardData.title_en ||
                          "Untitled Card"}
                      </h3>
                      <div
                        className="text-gray-600"
                        dangerouslySetInnerHTML={{
                          __html:
                            altContentData.altDescription ||
                            cardData.description_bn ||
                            cardData.description_en ||
                            "No description available",
                        }}
                      />
                    </div>
                  </div>
                )}
            </div>
          ) : (
            <div className="flex justify-center items-center p-8">
              <Button
                className="headlessbutton"
                type="primary"
                onClick={() => setIsModalVisible(true)}
                size="large"
              >
                Choose Card
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Multi-Language Configuration — same Collapse pattern as Slider */}
      {cardSelected && !preview && (
        <Collapse className="mt-4">
          <Panel
            header={
              <div className="flex items-center gap-2">
                <GlobalOutlined />
                Multi-Language Settings
              </div>
            }
            key="multilang"
          >
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-md font-semibold">
                    Display Alternative Content
                  </h4>
                  <p className="text-sm text-gray-600">
                    Toggle to show alternative titles and descriptions for this
                    card
                  </p>
                </div>
                <Switch
                  checked={showAltContent}
                  onChange={(checked) => {
                    setShowAltContent(checked);
                    updateComponent({
                      ...component,
                      _headless: {
                        ...cardData,
                        ...component._headless,
                        showAltContent: checked,
                        altTitle: altContentData.altTitle,
                        altDescription: altContentData.altDescription,
                      },
                    });
                  }}
                />
              </div>

              {showAltContent && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-800">
                    <strong>Alternative Content Mode:</strong> Card will display
                    alternative titles and descriptions when available.
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 bg-white rounded-lg border">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-lg font-semibold flex items-center gap-2">
                    <EditOutlined />
                    Custom Alternative Content
                  </h5>
                  <ComponentEditButton
                    onClick={handleEditAltContent}
                    title="Edit alternative content"
                  />
                </div>

                {isEditingAltContent ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alternative Title
                      </label>
                      <Input
                        value={altContentData.altTitle}
                        onChange={(e) =>
                          setAltContentData({
                            ...altContentData,
                            altTitle: e.target.value,
                          })
                        }
                        placeholder="Enter alternative title"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alternative Description
                      </label>
                      <RichTextEditor
                        defaultValue={altContentData.altDescription}
                        onChange={(html) =>
                          setAltContentData({
                            ...altContentData,
                            altDescription: html,
                          })
                        }
                        editMode={true}
                        maxLength={2000}
                      />
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <Button
                        onClick={handleCancelAltContent}
                        className="headlesscancelbutton"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="primary"
                        icon={<CheckOutlined />}
                        onClick={handleSaveAltContent}
                        className="headlessbutton"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border rounded-lg p-3 bg-blue-50">
                    <div className="font-medium text-sm mb-2">Card</div>
                    <div className="text-sm">
                      <div>
                        <strong>Alt Title:</strong>{" "}
                        {altContentData.altTitle || "Not set"}
                      </div>
                      <div>
                        <strong>Alt Description:</strong>{" "}
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              altContentData.altDescription || "Not set",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Panel>
        </Collapse>
      )}

      <CardSelectionModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSelectCard={handleSelectCard}
      />
    </div>
  );
};

export default CardComponent;
