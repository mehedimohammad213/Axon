// components/PageBuilder/Components/GoogleMapComponent.jsx

import React, { useState, useEffect } from "react";
import { Button, Modal, Typography, message, Popconfirm } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import GoogleMapSelectionModal from "../Modals/GoogleMapSelectionModal/GoogleMapSelectionModal";
import { buildGoogleMapsEmbedUrl } from "../utils/previewContrast";
import ComponentEditButton from "./components/ComponentEditButton";
import ComponentDeleteButton from "./components/ComponentDeleteButton";

const { Text } = Typography;

const hasSelectedMap = (map) =>
  Boolean(map?.mapUrl || map?.embedUrl || map?.coordinates);

const GoogleMapComponent = ({
  component,
  updateComponent,
  deleteComponent,
  preview = false, // New prop with default value
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [mapData, setMapData] = useState(
    hasSelectedMap(component._headless) ? component._headless : {}
  );

  useEffect(() => {
    setMapData(hasSelectedMap(component._headless) ? component._headless : {});
  }, [component._headless]);

  const handleSelectMap = (newMapData) => {
    updateComponent({
      ...component,
      _headless: newMapData,
      id: component._id,
    });
    setMapData(newMapData);
    setIsModalVisible(false);
    message.success("Google Map updated successfully.");
  };

  const handleDelete = () => {
    Modal.confirm({
      title: "Are you sure you want to delete this map?",
      onOk: deleteComponent,
      okText: "Yes",
      cancelText: "No",
    });
  };

  const getEmbedUrl = () => {
    return buildGoogleMapsEmbedUrl({
      embedUrl: mapData.embedUrl,
      mapUrl: mapData.mapUrl,
      coordinates: mapData.coordinates,
      zoom: mapData.zoom || 14,
    });
  };

  const MapFrame = ({ height = 360, allowChoose = false }) => {
    const src = getEmbedUrl();
    if (!hasSelectedMap(mapData)) {
      if (allowChoose) {
        return (
          <div className="flex justify-center items-center p-8">
            <Button
              className="headlessbutton"
              type="primary"
              onClick={() => setIsModalVisible(true)}
              size="large"
            >
              Choose Google Map
            </Button>
          </div>
        );
      }
      return (
        <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 text-center">
          <Text type="secondary">No map configured for this block.</Text>
        </div>
      );
    }
    if (!src) {
      return (
        <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed border-amber-200 bg-amber-50 px-4 text-center">
          <Text className="text-amber-800">
            Map location is incomplete. Add coordinates or an embed URL.
          </Text>
          {mapData.altTitle || mapData.mapUrl ? (
            <Text type="secondary" className="mt-2 text-xs">
              {mapData.altTitle || mapData.mapUrl}
            </Text>
          ) : null}
        </div>
      );
    }
    return (
      <div
        className="overflow-hidden rounded-lg border border-slate-200 shadow-sm"
        style={{ width: "100%", height }}
      >
        <iframe
          src={src}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={mapData.altTitle || "Google Map"}
        />
      </div>
    );
  };

  if (preview) {
    return (
      <div className="preview-google-map-component px-5 py-4">
        {(mapData.altTitle || mapData.placeName) && (
          <p className="mb-3 text-sm font-medium text-slate-700">
            {mapData.altTitle || mapData.placeName}
          </p>
        )}
        <MapFrame />
      </div>
    );
  }

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      {/* Header with Component Title and Action Buttons */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-800">Google Map</h3>
        <div>
          {hasSelectedMap(mapData) && (
            <ComponentEditButton
              onClick={() => setIsModalVisible(true)}
              title="Edit map"
              disabled={preview}
            />
          )}
          <ComponentDeleteButton
            onConfirm={handleDelete}
            title="Delete map"
            confirmTitle="Are you sure you want to delete this map?"
            disabled={preview}
          />
        </div>
      </div>

      <MapFrame height={400} allowChoose />

      {!preview && (
        <GoogleMapSelectionModal
          isVisible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onSelectMap={handleSelectMap}
          initialMap={mapData}
        />
      )}
    </div>
  );
};

export default GoogleMapComponent;
