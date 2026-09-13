// components/Navbars/NavbarHeader.js

import React from "react";
import { Input, Button, Select, message, Tooltip, Badge } from "antd";
import {
  CopyOutlined,
  PlusCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import Image from "next/image";

const { Option } = Select;

const NavbarHeader = ({
  onAddNavbar,
  searchTerm,
  setSearchTerm,
  sortType,
  setSortType,
  onShowChange,
  onRefresh,
  itemCount,
}) => {
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
      message.success("Data refreshed successfully");
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-4">
            <div className="rounded-xl border border-gray-200 bg-brand-light p-3">
              <Image
                src="/icons/headless/navbar.svg"
                width={28}
                height={28}
                alt="Navbars"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
                Navbars
              </h1>
              {typeof itemCount === "number" && (
                <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50/80 px-2.5 py-1">
                  <Badge
                    count={itemCount}
                    overflowCount={9999}
                    style={{ backgroundColor: "#2563eb" }}
                  />
                  <span className="text-xs font-medium text-blue-700">
                    total
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Tooltip title="Copy API endpoint">
              <Button
                icon={<CopyOutlined />}
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/navbars`
                  );
                  message.success("API endpoint copied");
                }}
              />
            </Tooltip>
            <Tooltip title="Refresh">
              <Button icon={<ReloadOutlined />} onClick={handleRefresh} />
            </Tooltip>
            <Button
              type="primary"
              icon={<PlusCircleOutlined />}
              onClick={onAddNavbar}
              className="bg-brand hover:bg-brand-dark"
            >
              Add Navbar
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={sortType}
              onChange={setSortType}
              className="w-36"
              options={[
                { value: "desc", label: "Newest first" },
                { value: "asc", label: "Oldest first" },
              ]}
            />
            <Select
              defaultValue="10"
              onChange={onShowChange}
              className="w-28"
            >
              <Option value="5">Show 5</Option>
              <Option value="10">Show 10</Option>
              <Option value="20">Show 20</Option>
              <Option value="50">Show 50</Option>
            </Select>
          </div>
          <div className="w-full sm:max-w-xs">
            <Input
              placeholder="Search navbars..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
              prefix={<SearchOutlined className="text-gray-400" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavbarHeader;
