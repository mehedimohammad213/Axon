// components/PageBuilder/PagesHeader.jsx

import {
  CloseCircleFilled,
  CopyOutlined,
  FilterOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
  SettingOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  LayoutOutlined,
} from "@ant-design/icons";
import {
  Button,
  Input,
  Select,
  Tooltip,
  message,
  Badge,
  Dropdown,
} from "antd";
import React, { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { copyApiEndpoint } from "../../utils/copyApiEndpoint";

const PagesHeader = ({
  onSearch,
  onCreate,
  onFooterCreate,
  createMode,
  onCancelCreate,
  sortType,
  setSortType,
  onShowChange,
  handleFilter,
  onRefresh,
  title = "Pages",
  section = "all",
  totalPages = 0,
  totalSubpages = 0,
  totalFooters = 0,
}) => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");

  const showPagesSection = section === "all" || section === "pages";
  const showFootersSection = section === "all" || section === "footers";
  const showTypeFilter = section === "all";

  const handleSearch = (value) => {
    setSearchValue(value);
    onSearch(value);
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
      message.success("Data refreshed successfully");
    }
  };

  const filterMenuItems = [
    {
      key: "all",
      label: "All Pages",
      icon: <SettingOutlined />,
    },
    {
      key: "pages",
      label: "Pages Only",
      icon: <SettingOutlined />,
    },
    {
      key: "subpages",
      label: "Subpages Only",
      icon: <SettingOutlined />,
    },
    ...(showFootersSection && section === "all"
      ? [
          {
            key: "footers",
            label: "Footers Only",
            icon: <SettingOutlined />,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-4">
      {/* Main Header */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
          {/* Left Section - Logo and Title */}
          <div className="flex items-center gap-4">
            <div
              className="cursor-pointer rounded-xl border border-gray-200 bg-brand-light p-3 transition-colors hover:bg-blue-100"
              onClick={() => router.push("/build-with-ai")}
            >
              <Image
                src={
                  section === "footers"
                    ? "/icons/headless/footer.svg"
                    : "/icons/headless/forms.svg"
                }
                width={28}
                height={28}
                alt={title}
              />
            </div>

            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
                {title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {showPagesSection && (
                  <div className="flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50/80 px-2.5 py-1">
                    <FileTextOutlined className="text-xs text-brand-dark" />
                    <Badge
                      count={totalPages}
                      showZero
                      className="[&_.ant-badge-count]:bg-brand [&_.ant-badge-count]:text-white [&_.ant-badge-count]:text-xs [&_.ant-badge-count]:min-w-[20px] [&_.ant-badge-count]:h-5 [&_.ant-badge-count]:leading-5"
                    />
                    <span className="ml-0.5 text-xs font-medium text-blue-700">
                      Pages
                    </span>
                  </div>
                )}
                {section === "all" && (
                  <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1">
                    <AppstoreOutlined className="text-xs text-gray-600" />
                    <Badge
                      count={totalSubpages}
                      showZero
                      className="[&_.ant-badge-count]:bg-gray-500 [&_.ant-badge-count]:text-white [&_.ant-badge-count]:text-xs [&_.ant-badge-count]:min-w-[20px] [&_.ant-badge-count]:h-5 [&_.ant-badge-count]:leading-5"
                    />
                    <span className="ml-0.5 text-xs font-medium text-gray-700">
                      Subpages
                    </span>
                  </div>
                )}
                {showFootersSection && (
                  <div className="flex items-center gap-1.5 rounded-lg border border-teal-100 bg-teal-50/80 px-2.5 py-1">
                    <LayoutOutlined className="text-xs text-teal-600" />
                    <Badge
                      count={totalFooters}
                      showZero
                      className="[&_.ant-badge-count]:bg-teal-500 [&_.ant-badge-count]:text-white [&_.ant-badge-count]:text-xs [&_.ant-badge-count]:min-w-[20px] [&_.ant-badge-count]:h-5 [&_.ant-badge-count]:leading-5"
                    />
                    <span className="ml-0.5 text-xs font-medium text-teal-700">
                      Footers
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {createMode ? (
              <Button
                icon={<CloseCircleFilled />}
                onClick={onCancelCreate}
                className="headlesscancelbutton h-10 px-5"
                size="large"
              >
                Cancel
              </Button>
            ) : (
              <>
                {showPagesSection && (
                  <Button
                    icon={<PlusCircleOutlined />}
                    className="h-10 rounded-lg border-0 bg-brand px-5 font-medium text-white shadow-sm hover:bg-brand-dark"
                    onClick={onCreate}
                    size="large"
                  >
                    Create Page
                  </Button>
                )}
                {showFootersSection && onFooterCreate && (
                  <Button
                    icon={<PlusCircleOutlined />}
                    className="h-10 rounded-lg border-0 bg-brand px-5 font-medium text-white shadow-sm hover:bg-brand-dark"
                    onClick={onFooterCreate}
                    size="large"
                  >
                    Create Footer
                  </Button>
                )}
                {section === "footers" && onCreate && !onFooterCreate && (
                  <Button
                    icon={<PlusCircleOutlined />}
                    className="h-10 rounded-lg border-0 bg-brand px-5 font-medium text-white shadow-sm hover:bg-brand-dark"
                    onClick={onCreate}
                    size="large"
                  >
                    Create Footer
                  </Button>
                )}
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
                    onClick={() =>
                      copyApiEndpoint(
                        section === "footers"
                          ? "/pages?type=Footer"
                          : "/pages"
                      )
                    }
                    size="large"
                  />
                </Tooltip>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col items-stretch justify-between gap-4 lg:flex-row lg:items-center">
          {/* Left Controls - Sorting and Filtering */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Sort Control */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Sort</span>
              <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                <Button
                  type={sortType === "desc" ? "primary" : "text"}
                  size="small"
                  onClick={() => setSortType("desc")}
                  className={`rounded-md px-3 py-1 text-sm font-medium ${
                    sortType === "desc"
                      ? "bg-brand text-white"
                      : "text-gray-600 hover:bg-white hover:text-gray-800"
                  }`}
                >
                  Newest
                </Button>
                <Button
                  type={sortType === "asc" ? "primary" : "text"}
                  size="small"
                  onClick={() => setSortType("asc")}
                  className={`rounded-md px-3 py-1 text-sm font-medium ${
                    sortType === "asc"
                      ? "bg-brand text-white"
                      : "text-gray-600 hover:bg-white hover:text-gray-800"
                  }`}
                >
                  Oldest
                </Button>
              </div>
            </div>

            {/* Filter Control */}
            {showTypeFilter && handleFilter && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Filter</span>
                <Dropdown
                  menu={{
                    items: filterMenuItems,
                    onClick: ({ key }) => handleFilter(key),
                  }}
                  placement="bottomLeft"
                >
                  <Button
                    icon={<FilterOutlined />}
                    className="h-9 rounded-lg border-gray-200 font-medium text-gray-700 hover:border-brand hover:text-brand-dark"
                  >
                    Type
                  </Button>
                </Dropdown>
              </div>
            )}
          </div>

          {/* Right Controls - Items per page and Search */}
          <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Show</span>
              <Select
                defaultValue="10"
                className="w-24 [&_.ant-select-selector]:h-9 [&_.ant-select-selector]:rounded-lg [&_.ant-select-selector]:border-gray-200"
                onChange={onShowChange}
              >
                <Select.Option value="10">10</Select.Option>
                <Select.Option value="20">20</Select.Option>
                <Select.Option value="50">50</Select.Option>
                <Select.Option value="100">100</Select.Option>
                <Select.Option value="200">200</Select.Option>
              </Select>
            </div>

            <Input
              placeholder={
                section === "footers"
                  ? "Search footers..."
                  : section === "pages"
                    ? "Search pages..."
                    : "Search pages..."
              }
              className="h-9 w-full rounded-lg border-gray-200 sm:w-72 [&_.ant-input]:placeholder:text-gray-400"
              allowClear
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              prefix={<SearchOutlined className="text-gray-400" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagesHeader;
