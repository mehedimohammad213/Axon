import React from "react";
import { Empty } from "antd";
import { RestOutlined } from "@ant-design/icons";
import TrashRow from "./TrashRow";

const TrashList = ({
  items,
  expandedItemId,
  handleExpand,
  onRestore,
  onDelete,
  busyKey,
  itemKey,
  isEmptyTrash,
}) => {
  if (!items.length) {
    return (
      <div className="mt-6 flex items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16">
        <Empty
          image={
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-2xl text-brand-dark">
              <RestOutlined />
            </div>
          }
          description={
            <div className="space-y-1">
              <p className="text-base font-medium text-gray-800">
                {isEmptyTrash ? "Trash is empty" : "No matching items"}
              </p>
              <p className="text-sm text-gray-500">
                {isEmptyTrash
                  ? "Deleted items will appear here."
                  : "Try a different search or filter."}
              </p>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
        {items.map((item) => {
          const key = itemKey(item);
          return (
            <TrashRow
              key={key}
              item={item}
              expandedItemId={expandedItemId}
              handleExpand={handleExpand}
              onRestore={onRestore}
              onDelete={onDelete}
              busy={busyKey === key}
            />
          );
        })}
      </div>
    </div>
  );
};

export default TrashList;
