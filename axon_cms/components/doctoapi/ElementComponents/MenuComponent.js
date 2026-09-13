// components/doctoapi/ElementComponents/MenuComponent.js

import React, { useEffect } from "react";

const MenuComponent = ({ data, onDataChange }) => {
  useEffect(() => {
    const jsonData = {
      type: "menu",
      menu_item_ids: data.menu_item_ids || [],
    };
    onDataChange(jsonData);
  }, [data, onDataChange]);

  return null; // No UI needed
};

export default MenuComponent;
