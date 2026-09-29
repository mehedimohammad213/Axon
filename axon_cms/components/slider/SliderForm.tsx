// components/slider/SliderForm.jsx

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Drawer, Form, Button, message } from "antd";
import MediaSelectionModal from "../PageBuilder/Modals/MediaSelectionModal";
import UploadMediaTabs from "../Gallery/UploadMediaTabs";
import CreateCardForm from "../cards/CreateCardForm";
import instance from "../../axios";
import BasicInfoForm from "./SliderForm/BasicInfoForm";
import SliderTypeTabs from "./SliderForm/SliderTypeTabs";
import MediaSelector from "./SliderForm/MediaSelector";
import CardSelector from "./SliderForm/CardSelector";
import { orderByIds } from "./SliderForm/orderByIds";

const SliderForm = ({
  form,
  type,
  setType,
  selectedMedia,
  setSelectedMedia,
  selectedCards,
  setSelectedCards,
  editingItemId,
  fetchSliders,
  onCancelEdit,
  isFormVisible,
  setIsFormVisible,
  allTags,
  onSliderCreated,
}) => {
  const [isMediaModalVisible, setIsMediaModalVisible] = useState(false);
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [isCreateCardVisible, setIsCreateCardVisible] = useState(false);
  const [cards, setCards] = useState([]);
  const [pages, setPages] = useState([]);
  const [media, setMedia] = useState([]);

  const fetchCards = useCallback(async () => {
    try {
      const response = await instance.get("/cards");
      if (response.data) {
        setCards(response.data);
      }
    } catch (error) {
      message.error("Failed to fetch cards.");
    }
  }, []);

  const fetchCardFormData = useCallback(async () => {
    try {
      const [mediaResponse, pagesResponse] = await Promise.all([
        instance.get("/media"),
        instance.get("/pages"),
      ]);
      if (mediaResponse.data) {
        setMedia(mediaResponse.data);
      }
      if (pagesResponse.data) {
        setPages(pagesResponse.data);
      }
    } catch (error) {
      message.error("Failed to fetch card form data.");
    }
  }, []);

  const uniqueTags = useMemo(() => {
    const tags = new Set();
    cards.forEach((card) => {
      card.additional?.tags?.forEach((tag) => tags.add(tag));
    });
    return [...tags];
  }, [cards]);

  // Define selectionMode as a constant
  const selectionMode = "multiple";

  useEffect(() => {
    fetchCards();
    fetchCardFormData();
  }, [fetchCards, fetchCardFormData]);

  useEffect(() => {
    if (!isFormVisible) {
      setIsMediaModalVisible(false);
      setIsUploadModalVisible(false);
      setIsCreateCardVisible(false);
    }
  }, [isFormVisible]);

  const handleImageUploadSuccess = (newMedia) => {
    const uploadedItems = (Array.isArray(newMedia) ? newMedia : [newMedia]).filter(
      Boolean
    );

    if (uploadedItems.length > 0) {
      setSelectedMedia((prev) => {
        const existingIds = new Set(prev.map((item) => item.id));
        const additions = uploadedItems.filter((item) => !existingIds.has(item.id));
        return [...prev, ...additions];
      });
      message.success("Image uploaded successfully.");
    }

    setIsUploadModalVisible(false);
  };

  const handleCardCreateSuccess = async () => {
    await fetchCards();
    setIsCreateCardVisible(false);
  };

  // Prepopulate form fields and selections when editing
  useEffect(() => {
    if (editingItemId) {
      const populateForm = async () => {
        try {
          const response = await instance.get(`/sliders/${editingItemId}`);
          const slider = response.data;
          if (slider) {
            form.setFieldsValue({
              title_en: slider.title_en,
              title_bn: slider.title_bn,
              description_en: slider.description_en,
              description_bn: slider.description_bn,
              type: slider.type,
              // tags: slider.additional?.tags || [],
            });
            setSelectedMedia(
              orderByIds(slider.medias || [], slider.media_ids || [])
            );
            setSelectedCards(slider.card_ids || []);
            setType(slider.type);
          }
        } catch (error) {
          message.error("Failed to fetch slider details.");
        }
      };
      populateForm();
    }
  }, [editingItemId, form, setType, setSelectedMedia, setSelectedCards]);

  useEffect(() => {
    if (isFormVisible && !editingItemId) {
      form.setFieldsValue({ type });
    }
  }, [isFormVisible, editingItemId, type, form]);

  const handleTypeChange = (value) => {
    setType(value);
    form.setFieldsValue({ type: value });

    if (value === "image") {
      setSelectedCards([]);
    } else if (value === "card") {
      setSelectedMedia([]);
    }
  };

  const handleSubmit = async (values) => {
    const sliderType = values.type || type;
    const payload = {
      title_en: values.title_en,
      title_bn: values.title_bn,
      description_en: values.description_en,
      description_bn: values.description_bn,
      type: sliderType,
    };

    // if (values.tags) {
    //   payload.additional = {
    //     ...(payload.additional || {}),
    //     tags: values.tags,
    //   };
    // }

    if (sliderType === "image") {
      payload.media_ids = selectedMedia?.map((media) => media.id);
      // Ensure card_ids are cleared
      payload.card_ids = [];
    } else if (sliderType === "card") {
      payload.card_ids = selectedCards;
      // Ensure media_ids are cleared
      payload.media_ids = [];
    }

    try {
      if (editingItemId) {
        const response = await instance.put(
          `/sliders/${editingItemId}`,
          payload
        );
        if (response.status === 200) {
          message.success("Slider updated successfully.");
          fetchSliders();
          onCancelEdit();
        }
      } else {
        const response = await instance.post("/sliders", payload);
        if (response.status === 201) {
          message.success("Slider created successfully.");
          if (onSliderCreated) {
            onSliderCreated(response.data);
          } else if (fetchSliders) {
            fetchSliders();
          }
          form.resetFields();
          setSelectedMedia([]);
          setSelectedCards([]);
          setType("image");
        }
      }
    } catch (error) {
      // message.error("Failed to submit slider.");
      console.error(error);
    } finally {
      setIsFormVisible(false);
    }
  };

  // Placeholder images
  const imagePlaceholder = "/images/Image_Placeholder.png";
  const cardPlaceholder = "/images/Card_Placeholder.png";

  return (
    <Drawer
      title={editingItemId ? "Edit Slider" : "Create Slider"}
      open={isFormVisible}
      onClose={onCancelEdit}
      width={`calc(100% - 40vw)`}
      destroyOnClose
      rootClassName="media-preview-drawer org-form-drawer"
      footer={
        <div className="flex justify-end">
          <Button
            type="primary"
            onClick={() => form.submit()}
            className="headlessbutton headlessbutton-pill !mr-0"
          >
            {editingItemId ? "Update Slider" : "Create Slider"}
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ type: "image" }}
      >
        <div
          style={{
            border: "1px solid #e8eef5",
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            background: "#ffffff",
          }}
        >
          <BasicInfoForm form={form} />
        </div>

        <div
          style={{
            border: "1px solid #e8eef5",
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            background: "#ffffff",
          }}
        >
          <Form.Item
            label="Slider Type"
            name="type"
            rules={[
              { required: true, message: "Please select the slider type." },
            ]}
          >
            <SliderTypeTabs type={type} handleTypeChange={handleTypeChange} />
          </Form.Item>

          {type === "image" ? (
            <Form.Item label="Media">
              <MediaSelector
                selectedMedia={selectedMedia}
                setSelectedMedia={setSelectedMedia}
                setIsMediaModalVisible={setIsMediaModalVisible}
                onCreateImage={() => setIsUploadModalVisible(true)}
                imagePlaceholder={imagePlaceholder}
              />
            </Form.Item>
          ) : (
            <Form.Item label="Select Cards">
              <CardSelector
                selectedCards={selectedCards}
                setSelectedCards={setSelectedCards}
                cards={cards}
                onCreateCard={() => setIsCreateCardVisible(true)}
              />
            </Form.Item>
          )}
        </div>
      </Form>

      <MediaSelectionModal
        isVisible={isMediaModalVisible}
        onClose={() => setIsMediaModalVisible(false)}
        onSelectMedia={(media) => {
          setSelectedMedia(media);
        }}
        selectionMode={selectionMode}
      />

      <Drawer
        title="Upload Image"
        open={isUploadModalVisible}
        onClose={() => setIsUploadModalVisible(false)}
        destroyOnClose
        width={800}
        zIndex={1100}
        rootClassName="media-preview-drawer org-form-drawer"
      >
        {isUploadModalVisible && (
          <div
            style={{
              border: "1px solid #e8eef5",
              borderRadius: 12,
              padding: 16,
              background: "#ffffff",
            }}
          >
            <UploadMediaTabs
              onUploadSuccess={handleImageUploadSuccess}
              addMedia={() => {}}
            />
          </div>
        )}
      </Drawer>

      {isCreateCardVisible && (
        <CreateCardForm
          pages={pages}
          media={media}
          uniqueTags={uniqueTags}
          onCancel={() => setIsCreateCardVisible(false)}
          onSuccess={handleCardCreateSuccess}
        />
      )}
    </Drawer>
  );
};

export default SliderForm;
