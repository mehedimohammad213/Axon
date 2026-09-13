import React from "react";
import { Badge, Button, Input, Tooltip, message } from "antd";
import {
  CopyOutlined,
  PlusCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import Image from "next/image";

const TablesHeader = ({
  itemCount,
  searchTerm,
  onSearch,
  onRefresh,
  onAddTable,
}) => {
  const handleRefresh = () => {
    onRefresh?.();
    message.success("Data refreshed successfully");
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex items-center gap-4">
          <div className="rounded-xl border border-gray-200 bg-brand-light p-3">
            <Image
              src="/icons/headless/table.svg"
              width={28}
              height={28}
              alt="Tables"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
              Tables
            </h1>
            {typeof itemCount === "number" && (
              <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50/80 px-2.5 py-1">
                <Badge
                  count={itemCount}
                  showZero
                  className="[&_.ant-badge-count]:bg-brand [&_.ant-badge-count]:text-white [&_.ant-badge-count]:text-xs [&_.ant-badge-count]:min-w-[20px] [&_.ant-badge-count]:h-5 [&_.ant-badge-count]:leading-5"
                />
                <span className="ml-0.5 text-xs font-medium text-blue-700">
                  {itemCount === 1 ? "Table" : "Tables"}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Input
            allowClear
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Search tables"
            value={searchTerm}
            onChange={(e) => onSearch?.(e.target.value)}
            className="h-10 w-64"
          />
          <Button
            icon={<PlusCircleOutlined />}
            onClick={onAddTable}
            className="h-10 rounded-lg border-0 bg-brand px-5 font-medium text-white shadow-sm hover:bg-brand-dark"
            size="large"
          >
            Create Table
          </Button>
          <Tooltip title="Refresh">
            <Button
              icon={<ReloadOutlined />}
              className="flex h-10 w-10 items-center justify-center rounded-lg border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-800"
              onClick={handleRefresh}
              size="large"
            />
          </Tooltip>
          <Tooltip title="Copy API endpoint">
            <Button
              icon={<CopyOutlined />}
              className="flex h-10 w-10 items-center justify-center rounded-lg border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-800"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${process.env.NEXT_PUBLIC_API_BASE_URL}/tables`
                );
                message.success("API endpoint copied");
              }}
              size="large"
            />
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default TablesHeader;
