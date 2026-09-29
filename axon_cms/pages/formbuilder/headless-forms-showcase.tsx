// pages/formbuilder/headless-forms-showcase.js
import React, { useState } from "react";
import HeadlessFormsList from "../../components/formbuilder/HeadlessFormsList";

const HeadlessFormsShowcase = ({ onFormCountChange, refreshRef }) => {
  const [selectedFormId, setSelectedFormId] = useState(null);

  const handleSelectForm = (formId) => {
    setSelectedFormId(formId);
  };

  return (
    <div className="w-full">
      <HeadlessFormsList
        onSelectForm={handleSelectForm}
        selectedFormId={selectedFormId}
        onFormCountChange={onFormCountChange}
        refreshRef={refreshRef}
      />
    </div>
  );
};

export default HeadlessFormsShowcase;
