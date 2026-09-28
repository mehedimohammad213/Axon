import React from "react";
import { Empty, Button } from "antd";
import { PlusOutlined, TableOutlined } from "@ant-design/icons";
import TableRow from "./TableRow";

const TablesList = ({
  tables,
  onPreview,
  onEdit,
  onDelete,
  onCreate,
}) => {
  if (!tables.length) {
    return (
      <div className="mt-6 flex items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16">
        <Empty
          image={
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-2xl text-brand-dark">
              <TableOutlined />
            </div>
          }
          description={
            <div className="space-y-1">
              <p className="text-base font-medium text-gray-800">
                No tables yet
              </p>
              <p className="text-sm text-gray-500">
                Create a reusable table to use in the page builder.
              </p>
            </div>
          }
        >
          {onCreate && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onCreate}
              className="headlessbutton headlessbutton-pill !mr-0 mt-2"
            >
              Create table
            </Button>
          )}
        </Empty>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tables.map((table) => (
          <TableRow
            key={table.id}
            table={table}
            onPreview={onPreview}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default TablesList;
