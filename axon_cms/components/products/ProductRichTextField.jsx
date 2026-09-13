import React from "react";
import RichTextEditor from "../RichTextEditor";

const ProductRichTextField = ({ value, onChange }) => {
  return (
    <RichTextEditor
      defaultValue={value || ""}
      onChange={(html) => onChange?.(html)}
      editMode
      maxLength={10000}
    />
  );
};

export default ProductRichTextField;
