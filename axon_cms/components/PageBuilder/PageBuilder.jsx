// components/PageBuilder/PageBuilder.jsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { setLoading } from "../../store/slices/pageSlice";

// Components
import PageHeader from "./Components/PageHeader";
import PageContent from "./Components/PageContent";
import PageLoadingStates from "./Components/PageLoadingStates";
import PagePreview from "./PagePreview";

// Hooks
import { usePageOperations } from "./hooks/usePageOperations";
import { usePageEffects } from "./hooks/usePageEffects";
import { getPageListPath } from "./utils/getPageListPath";

const PageBuilder = ({ pageId, editMode = false }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { pageData, loading, error, isDirty, lastSaved } = useSelector(
    (state) => state.page
  );

  const { canUndo, canRedo } = useSelector((state) => state.history);
  const [preview, setPreview] = useState(false);
  const [isEditing, setIsEditing] = useState(editMode);
  const cancelPendingAutoSaveRef = useRef(() => {});

  // Page operations
  const {
    fetchPageData,
    savePageData,
    handleSectionDuplicate,
    handleSectionDelete,
    handleAddSection,
    handleSectionsUpdate,
    handleUndo,
    handleRedo,
  } = usePageOperations(pageId, pageData, {
    cancelPendingAutoSave: () => cancelPendingAutoSaveRef.current(),
  });

  // Page effects (keyboard shortcuts, auto-save, etc.)
  const { cancelPendingAutoSave } = usePageEffects({
    pageId,
    isEditing,
    isDirty,
    onSave: () => savePageData(true),
    onUndo: handleUndo,
    onRedo: handleRedo,
    onFetchData: fetchPageData,
  });

  useEffect(() => {
    cancelPendingAutoSaveRef.current = cancelPendingAutoSave;
  }, [cancelPendingAutoSave]);

  const handleSaveAndRedirect = useCallback(async () => {
    if (isDirty) {
      const success = await savePageData(true);
      if (!success) return;
    }
    router.push(getPageListPath(pageData));
  }, [isDirty, savePageData, router, pageData]);

  // Handle editing state changes
  const handleEditingStateChange = (editing) => {
    setIsEditing(editing);
  };

  // Reset loading state if data is available
  useEffect(() => {
    if (loading && pageData) {
      dispatch(setLoading(false));
    }
  }, [loading, pageData, dispatch]);

  // Add timeout to prevent infinite loading
  useEffect(() => {
    if (loading) {
      const timeoutId = setTimeout(() => {
        dispatch(setLoading(false));
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeoutId);
    }
  }, [loading, dispatch]);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Loading, Error, and No Data States */}
      <PageLoadingStates
        loading={loading}
        error={error}
        pageData={pageData}
        onRetry={fetchPageData}
      />

      {/* Main Page Content */}
      {pageData && (
        <>
          {/* Header */}
          <PageHeader
            pageData={pageData}
            isEditing={isEditing}
            isDirty={isDirty}
            canUndo={canUndo}
            canRedo={canRedo}
            onToggleEdit={() => setIsEditing(!isEditing)}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onSave={handleSaveAndRedirect}
            loading={loading}
          />

          {/* Main Content */}
          <PageContent
            pageData={pageData}
            isEditing={isEditing}
            onSectionsUpdate={handleSectionsUpdate}
            onSectionDuplicate={handleSectionDuplicate}
            onSectionDelete={handleSectionDelete}
            onEditingStateChange={handleEditingStateChange}
            onAddSection={handleAddSection}
          />

          {/* Page Preview Modal */}
          <PagePreview
            pageData={pageData}
            open={preview}
            setOpen={setPreview}
          />
        </>
      )}
    </div>
  );
};

export default PageBuilder;
