// components/PageBuilder/Components/PageContent.jsx

import React, { useState, useCallback, useRef } from "react";
import { Button } from "antd";
import { PlusOutlined, LayoutOutlined } from "@ant-design/icons";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { useDispatch } from "react-redux";
import { setPageData, setIsDirty } from "../../../store/slices/pageSlice";
import SectionList from "../Sections/SectionList";
import { useCrossSectionDragAndDrop } from "../hooks/useCrossSectionDragAndDrop";
import { useSectionDragAndDrop } from "../Sections/hooks/useSectionDragAndDrop";
import PageBuilderDragOverlay from "./PageBuilderDragOverlay";
import {
  buildDndLookup,
  isSectionDragId,
  resolveDropSectionIndex,
} from "../utils/pageBuilderDndUtils";

const PageContent = ({
  pageData,
  isEditing,
  onSectionsUpdate,
  onSectionDuplicate,
  onSectionDelete,
  onEditingStateChange,
  onAddSection,
}) => {
  const dispatch = useDispatch();
  const { onDragEnd: onCrossSectionDragEnd } = useCrossSectionDragAndDrop();
  const { onDragEnd: onSectionDragEnd } = useSectionDragAndDrop({
    sections: pageData?.body,
    onSectionsUpdate,
  });

  const [activeId, setActiveId] = useState(null);
  const [activeComponent, setActiveComponent] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [dragOverSection, setDragOverSection] = useState(null);
  const [isDraggingSection, setIsDraggingSection] = useState(false);

  const dndLookupRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const resetDragState = useCallback(() => {
    setActiveId(null);
    setActiveComponent(null);
    setActiveSection(null);
    setDragOverSection(null);
    setIsDraggingSection(false);
    dndLookupRef.current = null;
  }, []);

  const handleDragStart = useCallback(
    (event) => {
      const { active } = event;
      const activeIdStr = String(active.id);
      setActiveId(active.id);

      const lookup = buildDndLookup(pageData?.body || []);
      dndLookupRef.current = lookup;

      if (lookup.sectionIdToIndex.has(activeIdStr)) {
        const sectionIndex = lookup.sectionIdToIndex.get(activeIdStr);
        const section = pageData.body[sectionIndex];
        setActiveSection({
          ...section,
          sectionIndex,
        });
        setIsDraggingSection(true);
        return;
      }

      const location = lookup.componentMap.get(activeIdStr);
      if (location) {
        setActiveComponent({
          ...location.component,
          sectionIndex: location.sectionIndex,
          type: location.component.type || "Component",
        });
      }
    },
    [pageData]
  );

  const handleDragOver = useCallback((event) => {
    const { over, active } = event;

    if (!over) {
      setDragOverSection(null);
      return;
    }

    const lookup = dndLookupRef.current;
    if (!lookup) {
      setDragOverSection(null);
      return;
    }

    if (lookup.sectionIdToIndex.has(String(active.id))) {
      setDragOverSection(null);
      return;
    }

    const overIdStr = String(over.id);
    let targetSection = -1;

    if (overIdStr.startsWith("section-drop-")) {
      targetSection = parseInt(overIdStr.replace("section-drop-", ""), 10);
    } else if (lookup.componentMap.has(overIdStr)) {
      targetSection = lookup.componentMap.get(overIdStr).sectionIndex;
    }

    setDragOverSection(targetSection >= 0 ? targetSection : null);
  }, []);

  const handleWithinSectionDrag = useCallback(
    (event, sectionIndex) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const section = pageData.body[sectionIndex];
      if (!section) return;

      const activeIndex = section.data.findIndex((comp, idx) => {
        const componentId = comp._id ?? `component-${sectionIndex}-${idx}`;
        return String(active.id) === String(componentId);
      });

      const overIndex = section.data.findIndex((comp, idx) => {
        const componentId = comp._id ?? `component-${sectionIndex}-${idx}`;
        return String(over.id) === String(componentId);
      });

      if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
        return;
      }

      const newComponents = arrayMove(section.data, activeIndex, overIndex);

      dispatch(
        setPageData({
          ...pageData,
          body: pageData.body.map((s, i) =>
            i === sectionIndex ? { ...s, data: newComponents } : s
          ),
        })
      );
      dispatch(setIsDirty(true));
    },
    [pageData, dispatch]
  );

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;

      if (isSectionDragId(active.id, pageData?.body || [])) {
        resetDragState();
        onSectionDragEnd(event);
        return;
      }

      if (!over || active.id === over.id) {
        resetDragState();
        return;
      }

      const lookup = buildDndLookup(pageData?.body || []);
      const sourceLocation = lookup.componentMap.get(String(active.id));

      if (!sourceLocation) {
        resetDragState();
        return;
      }

      const destinationSectionIndex = resolveDropSectionIndex(
        over.id,
        pageData?.body || []
      );

      if (
        destinationSectionIndex !== -1 &&
        sourceLocation.sectionIndex === destinationSectionIndex
      ) {
        handleWithinSectionDrag(event, sourceLocation.sectionIndex);
        resetDragState();
        return;
      }

      resetDragState();
      onCrossSectionDragEnd(event);
    },
    [
      pageData,
      onSectionDragEnd,
      onCrossSectionDragEnd,
      handleWithinSectionDrag,
      resetDragState,
    ]
  );

  const handleDragCancel = useCallback(() => {
    resetDragState();
  }, [resetDragState]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="bg-transparent">
        <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
          {pageData?.body?.length > 0 ? (
            <>
              <SectionList
                sections={pageData.body}
                setSections={onSectionsUpdate}
                onSectionDuplicate={onSectionDuplicate}
                onSectionDelete={onSectionDelete}
                onEditingStateChange={onEditingStateChange}
                isEditing={isEditing}
                dragOverSection={dragOverSection}
                activeId={activeId}
                isDraggingSection={isDraggingSection}
              />
              {isEditing && (
                <div className="mt-4 flex justify-end pt-4">
                  <Button
                    icon={<PlusOutlined />}
                    onClick={onAddSection}
                    className="headlessbutton !mr-0 !border-0 shadow-sm"
                    size="large"
                  >
                    Add section
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
              <LayoutOutlined className="mb-4 text-4xl text-slate-300" />
              <p className="mb-2 text-lg font-semibold text-slate-900">
                Start building your page
              </p>
              <p className="mx-auto mb-2 max-w-md text-sm leading-relaxed text-slate-500">
                Sections organize your page into rows. Add components inside each
                section for text, images, buttons, and more.
              </p>
              {isEditing && (
                <div className="mt-6 flex justify-end">
                  <Button
                    icon={<PlusOutlined />}
                    onClick={onAddSection}
                    className="headlessbutton !mr-0 !border-0 shadow-sm"
                    size="large"
                  >
                    Add first section
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <PageBuilderDragOverlay
        activeComponent={activeComponent}
        activeSection={activeSection}
      />
    </DndContext>
  );
};

export default PageContent;
