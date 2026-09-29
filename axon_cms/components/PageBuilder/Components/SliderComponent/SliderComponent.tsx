import React, { useState, useEffect, useCallback } from "react";
import { Modal, message, Button, Collapse, Switch, Form, Input } from "antd";
import { EditOutlined, GlobalOutlined, CheckOutlined } from "@ant-design/icons";
import SliderRenderer from "./SliderRenderer";
import ComponentEditButton from "../components/ComponentEditButton";
import { useSliderRefresh } from "./SliderRefresh";
import SliderActions from "./SliderActions";
import SliderSelectionModal from "../../Modals/SliderSelectionModal";
import RichTextEditor from "../../../RichTextEditor";
import { resolveMediaUrl } from "../../../../utils/mediaUrl";

const { Panel } = Collapse;

const hasSelectedSlider = (slider) =>
  Boolean(
    slider?.id ||
      (Array.isArray(slider?.medias) && slider.medias.length > 0) ||
      (Array.isArray(slider?.cards) && slider.cards.length > 0) ||
      (Array.isArray(slider?.additional?.slides) &&
        slider.additional.slides.length > 0) ||
      slider?.title_en
  );

const SliderComponent = ({
  component,
  updateComponent,
  deleteComponent,
  preview = false,
  isEditing = false,
  onDuplicateElement,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [sliderData, setSliderData] = useState(
    hasSelectedSlider(component._headless) ? component._headless : null
  );
  const [sliderConfig, setSliderConfig] = useState({
    autoplay: component._headless?.config?.autoplay ?? true,
    dots: component._headless?.config?.dots ?? false,
    effect: component._headless?.config?.effect ?? "scroll",
    speed: component._headless?.config?.speed ?? 500,
    height: component._headless?.config?.height ?? 400,
  });
  const [showAltContent, setShowAltContent] = useState(false);
  const [showAltInputs, setShowAltInputs] = useState(false);
  const [showSliderAltInputs, setShowSliderAltInputs] = useState(false);
  const [sliderAltTitle, setSliderAltTitle] = useState(
    hasSelectedSlider(component._headless)
      ? component._headless?.altTitle || ""
      : ""
  );
  const [sliderAltDescription, setSliderAltDescription] = useState(
    hasSelectedSlider(component._headless)
      ? component._headless?.altDescription || ""
      : ""
  );
  const [tempSliderAltTitle, setTempSliderAltTitle] = useState("");
  const [tempSliderAltDescription, setTempSliderAltDescription] = useState("");

  // Use the refresh hook with isEditing state and preview mode
  const { isRefreshing, pollingError, handleManualRefresh } = useSliderRefresh(
    sliderData,
    component,
    updateComponent,
    preview,
    isEditing
  );

  // Synchronize sliderData with component._headless when it changes
  useEffect(() => {
    if (hasSelectedSlider(component._headless)) {
      setSliderData(component._headless);
      setShowAltContent(component._headless?.showAltContent || false);
      setSliderAltTitle(component._headless?.altTitle || "");
      setSliderAltDescription(component._headless?.altDescription || "");

      if (component._headless?.config) {
        setSliderConfig((prevConfig) => ({
          ...prevConfig,
          ...component._headless.config,
        }));
      }
    } else {
      setSliderData(null);
      setShowAltContent(false);
      setSliderAltTitle("");
      setSliderAltDescription("");
    }
  }, [component._headless]);

  // Page body embeds often omit medias — hydrate from /sliders when needed
  useEffect(() => {
    const headless = component._headless;
    const sliderId = component.id || headless?.id;
    if (!sliderId) return;

    const hasMedias =
      (Array.isArray(headless?.medias) && headless.medias.length > 0) ||
      (Array.isArray(headless?.additional?.slides) &&
        headless.additional.slides.length > 0);
    if (hasMedias) return;

    let cancelled = false;

    async function hydrateSlider() {
      try {
        const { default: instance } = await import("../../../../axios");
        const response = await instance.get("/sliders");
        if (cancelled || !Array.isArray(response.data)) return;

        const full = response.data.find((s) => s.id === sliderId);
        if (!full) return;

        const merged = {
          ...headless,
          ...full,
          config: headless?.config || full.config,
        };
        setSliderData(merged);
        updateComponent({
          ...component,
          _headless: merged,
          id: full.id,
        });
      } catch (error) {
        console.error("Failed to hydrate slider medias:", error);
      }
    }

    void hydrateSlider();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [component.id, component._headless?.id]);

  // Handle selection from SliderSelectionModal — link immediately to section
  const handleSelectSlider = useCallback(
    (selectedSlider) => {
      if (
        selectedSlider.type === "card" &&
        (!selectedSlider.cards || selectedSlider.cards.length === 0)
      ) {
        Modal.error({
          title: "Validation Error",
          content: "Selected card slider has no cards.",
        });
        return;
      }

      const isCard = (selectedSlider.type || "").toLowerCase() === "card";
      const hasMedias =
        (Array.isArray(selectedSlider.medias) &&
          selectedSlider.medias.length > 0) ||
        (Array.isArray(selectedSlider.additional?.slides) &&
          selectedSlider.additional.slides.length > 0);

      if (!isCard && !hasMedias) {
        Modal.error({
          title: "Validation Error",
          content: "Selected image slider has no images.",
        });
        return;
      }

      const config = selectedSlider.config || sliderConfig;
      const linkedSlider = { ...selectedSlider, config };

      const updatedComponent = {
        ...component,
        _headless: linkedSlider,
        id: selectedSlider.id,
      };

      updateComponent(updatedComponent);
      setSliderData(linkedSlider);
      setSliderConfig(config);
      setIsModalVisible(false);
      message.success("Slider linked to section successfully.");
    },
    [component, updateComponent, sliderConfig]
  );

  // Handle Delete Component
  const handleDelete = useCallback(() => {
    deleteComponent();
  }, [deleteComponent]);

  // Handle Main Slider Alt Content Edit
  const handleEditSliderAltContent = useCallback(() => {
    setTempSliderAltTitle(sliderAltTitle);
    setTempSliderAltDescription(sliderAltDescription);
    setShowSliderAltInputs(true);
  }, [sliderAltTitle, sliderAltDescription]);

  // Handle Main Slider Alt Content Save
  const handleSaveSliderAltContent = useCallback(() => {
    setSliderAltTitle(tempSliderAltTitle);
    setSliderAltDescription(tempSliderAltDescription);
    updateComponent({
      ...component,
      _headless: {
        ...sliderData,
        altTitle: tempSliderAltTitle,
        altDescription: tempSliderAltDescription,
      },
    });
    setShowSliderAltInputs(false);
    message.success("Main slider alternative content updated successfully.");
  }, [
    tempSliderAltTitle,
    tempSliderAltDescription,
    component,
    sliderData,
    updateComponent,
  ]);

  // Handle Main Slider Alt Content Cancel
  const handleCancelSliderAltContent = useCallback(() => {
    setTempSliderAltTitle(sliderAltTitle);
    setTempSliderAltDescription(sliderAltDescription);
    setShowSliderAltInputs(false);
  }, [sliderAltTitle, sliderAltDescription]);

  // If in preview mode, render the slider content only
  if (preview) {
    return (
      <div className="preview-slider-component px-5 py-4">
        <SliderRenderer sliderData={sliderData} config={sliderData?.config} />
      </div>
    );
  }

  return (
    <div className="border p-4 rounded-md bg-white">
      <SliderActions
        sliderData={sliderData}
        isEditing={false}
        selectedSliderData={null}
        isRefreshing={isRefreshing}
        pollingError={pollingError}
        onRefresh={handleManualRefresh}
        onEdit={() => setIsModalVisible(true)}
        onDuplicate={onDuplicateElement}
        onDelete={handleDelete}
        onSubmit={() => {}}
        onCancel={() => {}}
      />

      <div className="flex flex-col md:flex-row items-start gap-4">
        <div className="flex flex-col w-full">
          {sliderData ? (
            <div className="w-full relative">
              <SliderRenderer
                sliderData={sliderData}
                config={sliderData.config}
              />
            </div>
          ) : (
            <div className="flex justify-center items-center p-8">
              <Button
                className="headlessbutton"
                type="primary"
                onClick={() => setIsModalVisible(true)}
                size="large"
              >
                Choose Slider
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Multi-Language Configuration */}
      {sliderData && !preview && (
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
                    Toggle to show alternative titles and descriptions for
                    slider items
                  </p>
                </div>
                <Switch
                  checked={showAltContent}
                  onChange={(checked) => {
                    setShowAltContent(checked);
                    updateComponent({
                      ...component,
                      _headless: {
                        ...sliderData,
                        showAltContent: checked,
                      },
                    });
                  }}
                />
              </div>

              {showAltContent && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-800">
                    <strong>Alternative Content Mode:</strong> Slider items will
                    display alternative titles and descriptions when available.
                  </div>
                </div>
              )}

              {/* Main Slider Alternative Content */}
              <div className="mt-6 p-4 bg-white rounded-lg border">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-lg font-semibold flex items-center gap-2">
                    <EditOutlined />
                    Main Slider Alternative Content
                  </h5>
                  <ComponentEditButton
                    onClick={handleEditSliderAltContent}
                    title="Edit alternative content"
                  />
                </div>

                {showSliderAltInputs ? (
                  <div className="space-y-4">
                    <Form layout="vertical" className="w-full">
                      <Form.Item label="Alternative Title" className="mb-3">
                        <RichTextEditor
                          defaultValue={tempSliderAltTitle}
                          editMode={true}
                          onChange={(html) => setTempSliderAltTitle(html)}
                        />
                      </Form.Item>

                      <Form.Item
                        label="Alternative Description"
                        className="mb-3"
                      >
                        <RichTextEditor
                          defaultValue={tempSliderAltDescription}
                          onChange={setTempSliderAltDescription}
                          editMode={true}
                          maxLength={1000}
                        />
                      </Form.Item>
                    </Form>

                    {/* Save/Cancel Buttons */}
                    <div className="mt-4 flex justify-end gap-2">
                      <Button
                        onClick={handleCancelSliderAltContent}
                        className="headlesscancelbutton"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="primary"
                        icon={<CheckOutlined />}
                        onClick={handleSaveSliderAltContent}
                        className="headlessbutton"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Display Current Main Slider Alternative Content */
                  <div className="border rounded-lg p-3 bg-blue-50">
                    <div className="font-medium text-sm mb-2">Main Slider</div>
                    <div className="text-sm">
                      <div>
                        <strong>Alt Title:</strong>{" "}
                        <div
                          dangerouslySetInnerHTML={{
                            __html: sliderAltTitle || "Not set",
                          }}
                        />
                      </div>
                      <div>
                        <strong>Alt Description:</strong>{" "}
                        <div
                          dangerouslySetInnerHTML={{
                            __html: sliderAltDescription || "Not set",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Individual Items Alternative Content Editing Section */}
              <div className="mt-6 p-4 bg-white rounded-lg border">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-lg font-semibold flex items-center gap-2">
                    <EditOutlined />
                    Individual Items Alternative Content
                  </h5>
                  <ComponentEditButton
                    onClick={() => setShowAltInputs(true)}
                    title="Edit alternative content"
                  />
                </div>

                {showAltInputs ? (
                  <div className="space-y-4">
                    {sliderData.type === "image" &&
                      sliderData.medias &&
                      sliderData.medias.map((media, index) => (
                        <div
                          key={index}
                          className="border rounded-lg p-4 bg-gray-50"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <img
                              src={resolveMediaUrl(media.file_path)}
                              alt={media.title || "Media"}
                              className="w-16 h-12 rounded object-cover"
                            />
                            <div>
                              <div className="font-medium text-sm">
                                {media.title || media.file_name || "Untitled"}
                              </div>
                            </div>
                          </div>

                          <Form layout="vertical" className="w-full">
                            <Form.Item
                              label="Alternative Title"
                              className="mb-3"
                            >
                              <RichTextEditor
                                defaultValue={media.altTitle || ""}
                                editMode={true}
                                onChange={(html) => {
                                  const updatedMedias = [...sliderData.medias];
                                  updatedMedias[index] = {
                                    ...updatedMedias[index],
                                    altTitle: html,
                                  };
                                  setSliderData({
                                    ...sliderData,
                                    medias: updatedMedias,
                                  });
                                }}
                              />
                            </Form.Item>

                            <Form.Item
                              label="Alternative Description"
                              className="mb-3"
                            >
                              <RichTextEditor
                                defaultValue={media.altDescription || ""}
                                editMode={true}
                                onChange={(html) => {
                                  const updatedMedias = [...sliderData.medias];
                                  updatedMedias[index] = {
                                    ...updatedMedias[index],
                                    altDescription: html,
                                  };
                                  setSliderData({
                                    ...sliderData,
                                    medias: updatedMedias,
                                  });
                                }}
                              />
                            </Form.Item>
                          </Form>
                        </div>
                      ))}

                    {sliderData.type === "card" &&
                      sliderData.cards &&
                      sliderData.cards.map((card, index) => (
                        <div
                          key={index}
                          className="border rounded-lg p-4 bg-gray-50"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            {card.image && (
                              <img
                                src={resolveMediaUrl(card.image.file_path)}
                                alt={card.title || "Card"}
                                className="w-16 h-12 rounded object-cover"
                              />
                            )}
                            <div>
                              <div className="font-medium text-sm">
                                {card.title || "Untitled Card"}
                              </div>
                            </div>
                          </div>

                          <Form layout="vertical" className="w-full">
                            <Form.Item
                              label="Alternative Title"
                              className="mb-3"
                            >
                              <RichTextEditor
                                defaultValue={card.altTitle || ""}
                                editMode={true}
                                onChange={(html) => {
                                  const updatedCards = [...sliderData.cards];
                                  updatedCards[index] = {
                                    ...updatedCards[index],
                                    altTitle: html,
                                  };
                                  setSliderData({
                                    ...sliderData,
                                    cards: updatedCards,
                                  });
                                }}
                              />
                            </Form.Item>

                            <Form.Item
                              label="Alternative Description"
                              className="mb-3"
                            >
                              <RichTextEditor
                                defaultValue={card.altDescription || ""}
                                editMode={true}
                                onChange={(html) => {
                                  const updatedCards = [...sliderData.cards];
                                  updatedCards[index] = {
                                    ...updatedCards[index],
                                    altDescription: html,
                                  };
                                  setSliderData({
                                    ...sliderData,
                                    cards: updatedCards,
                                  });
                                }}
                              />
                            </Form.Item>
                          </Form>
                        </div>
                      ))}

                    {/* Update Button */}
                    <div className="mt-4 flex justify-end">
                      <Button
                        type="primary"
                        icon={<CheckOutlined />}
                        onClick={() => {
                          updateComponent({
                            ...component,
                            _headless: sliderData,
                          });
                          setShowAltInputs(false);
                          message.success(
                            "Alternative content updated successfully."
                          );
                        }}
                        className="headlessbutton"
                      >
                        Update Alternative Content
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Display Current Individual Items Alternative Content */
                  <div className="space-y-3">
                    {sliderData.type === "image" &&
                      sliderData.medias &&
                      sliderData.medias.map((media, index) => (
                        <div
                          key={index}
                          className="border rounded-lg p-3 bg-gray-50"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <img
                              src={resolveMediaUrl(media.file_path)}
                              alt={media.title || "Media"}
                              className="w-12 h-8 rounded object-cover"
                            />
                            <div>
                              <div className="font-medium text-sm">
                                {media.title || media.file_name || "Untitled"}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm">
                            <div>
                              <strong>Alt Title:</strong>{" "}
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: media.altTitle || "Not set",
                                }}
                              />
                            </div>
                            <div>
                              <strong>Alt Description:</strong>{" "}
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: media.altDescription || "Not set",
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                    {sliderData.type === "card" &&
                      sliderData.cards &&
                      sliderData.cards.map((card, index) => (
                        <div
                          key={index}
                          className="border rounded-lg p-3 bg-gray-50"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            {card.image && (
                              <img
                                src={resolveMediaUrl(card.image.file_path)}
                                alt={card.title || "Card"}
                                className="w-12 h-8 rounded object-cover"
                              />
                            )}
                            <div>
                              <div className="font-medium text-sm">
                                {card.title || "Untitled Card"}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm">
                            <div>
                              <strong>Alt Title:</strong>{" "}
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: card.altTitle || "Not set",
                                }}
                              />
                            </div>
                            <div>
                              <strong>Alt Description:</strong>{" "}
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: card.altDescription || "Not set",
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </Panel>
        </Collapse>
      )}

      <SliderSelectionModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSelectSlider={handleSelectSlider}
      />
    </div>
  );
};

export default SliderComponent;
