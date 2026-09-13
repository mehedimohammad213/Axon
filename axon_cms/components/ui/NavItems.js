// components/ui/NavItems.js

import {
  SearchOutlined,
  LoginOutlined,
  UserOutlined,
  DeploymentUnitOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Input, Layout, Dropdown, Button, Tooltip, message, Modal } from "antd";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import TopNavData from "../../src/data/topnavdata.json";
import AuthorisedMenus from "../../src/data/authorisedsidemenus.json";
import GodfatherMenus from "../../src/data/godfather.json";
import { filterMenuByPermissions } from "../../utils/permissions";
import Link from "next/link";
import Image from "next/image";
import { useMenuRefresh } from "../../src/context/MenuRefreshContext";
import OrganizationSelector from "../admin/OrganizationSelector";

export default function NavItems({
  user,
  token,
  organization,
  handleLogout,
  theme,
  setTheme,
}) {
  const [hovered, setHovered] = useState(false);
  const [topNavData, setTopNavData] = useState([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState("Home");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);
  const router = useRouter();
  const { triggerGlobalRefresh, isRefreshing } = useMenuRefresh();

  const handleGlobalRefresh = async () => {
    try {
      await triggerGlobalRefresh();
      message.success("All data refreshed successfully");
    } catch {
      message.error("Failed to refresh data");
    }
  };

  useEffect(() => {
    setTopNavData(TopNavData);
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const results = [];
    const query = searchQuery.toLowerCase();

    const searchableMenus = filterMenuByPermissions(
      [...AuthorisedMenus, ...GodfatherMenus],
      user
    );

    searchableMenus.forEach((menu) => {
      if (menu.submenu) {
        menu.submenu.forEach((item) => {
          if (
            item.title.toLowerCase().includes(query) ||
            menu.title.toLowerCase().includes(query)
          ) {
            results.push({
              ...item,
              category: menu.title,
              categoryIcon: menu.icon,
            });
          }
        });
      }
    });

    setSearchResults(results);
    setShowSearchResults(results.length > 0);
  }, [searchQuery, user]);

  // Click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchResultClick = (link) => {
    router.push(link);
    setSearchQuery("");
    setShowSearchResults(false);
  };

  const getUserMenuItemClass = (isActive) =>
    `block text-base rounded-md px-2 py-1 transition-colors duration-200 ${
      isActive
        ? "text-brand bg-brand-light font-semibold"
        : "text-gray-700 hover:bg-black/5 hover:text-gray-900"
    }`;

  const isProfileActive = router.pathname.startsWith("/user/profile");
  const isDashboardActive =
    router.pathname === "/dashboard" || router.pathname === "/";

  const confirmLogout = () => {
    Modal.confirm({
      title: "Logout",
      content: "Are you sure you want to logout?",
      okText: "Logout",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => handleLogout(),
    });
  };

  const userItems = [
    {
      key: "profile",
      label: (
        <Link href="/user/profile" className={getUserMenuItemClass(isProfileActive)}>
          Profile
        </Link>
      ),
    },
    {
      key: "dashboard",
      label: (
        <Link href="/dashboard" className={getUserMenuItemClass(isDashboardActive)}>
          Dashboard
        </Link>
      ),
    },
    {
      key: "logout",
      label: (
        <div
          onClick={(e) => {
            e.stopPropagation();
            confirmLogout();
          }}
          className="cursor-pointer text-base rounded-md px-2 py-1 text-gray-700
            hover:bg-black/5 hover:text-gray-900 transition-colors duration-200"
        >
          Logout
        </div>
      ),
    },
  ];

  return (
    <Layout.Header
      className="fixed w-full h-16 flex items-center justify-between px-3
    md:px-4 lg:px-6 bg-white border-b border-gray-200 z-50"
    >
      {/* Logo */}
      <div className="flex items-center gap-6 md:gap-8 flex-shrink-0">
        <div
          className="flex items-center cursor-pointer"
          onClick={() => router.push("/")}
        >
          <Image
            src="/images/ui/headless_logo.svg"
            alt="Headless Logo"
            width={140}
            height={36}
          />
        </div>
        {user?.is_super_admin ? (
          <OrganizationSelector />
        ) : (
          organization?.name && (
            <div className="hidden md:flex items-center gap-2">
              <div
                className="px-3 py-1 rounded-lg text-xs font-semibold text-white
                  bg-brand shadow-sm max-w-[180px] truncate"
                title={organization.name}
              >
                {organization.name}
              </div>
            </div>
          )
        )}
      </div>

      {user && token ? (
        <>
          {/* Navigation Tabs */}
          <div className="hidden lg:flex items-center gap-4 mx-2 flex-1 justify-center">
            {topNavData &&
              topNavData?.map((item) => (
                <Link key={item.name} href={item.link}>
                  <div
                    className={`px-3.5 py-1 rounded-lg text-base font-semibold cursor-pointer
                      ${topNavData && item === topNavData[topNavData.length - 1] ? "flex gap-2 text-white headlessaibutton" : "headlesstopnavbutton"}
                      transition-all duration-200 ${selectedMenuItem === item.name
                        ? "text-brand bg-brand-light"
                        : "text-gray-500 hover:bg-black/5 hover:text-gray-900"
                      }`}
                    onClick={() => setSelectedMenuItem(item.name)}
                  >
                    {item.name}

                    {topNavData && item === topNavData[topNavData.length - 1] ? (
                      <DeploymentUnitOutlined />
                    ) : ""}
                  </div>
                </Link>
              ))}
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Search Bar - Desktop only on larger screens */}
            <div className="hidden xl:flex items-center gap-2 mr-2">
              <div className="relative" ref={searchRef}>
              <Input
                placeholder="Search..."
                prefix={<SearchOutlined className="text-gray-400 text-base" />}
                className="w-[28rem] h-10 rounded-lg text-base border-gray-200
                  focus:border-brand hover:border-brand"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowSearchResults(true)}
              />

              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-12 right-0 w-96 max-h-96 overflow-y-auto bg-white rounded-lg shadow-lg border border-gray-200 search-results-dropdown z-50">
                  <div className="p-3 border-b border-gray-100 bg-brand-light">
                    <p className="text-sm font-semibold text-gray-700">
                      Quick Navigation ({searchResults.length} results)
                    </p>
                  </div>

                  <div className="p-2">
                    {searchResults.map((result, index) => (
                      <div
                        key={`${result.id}-${index}`}
                        onClick={() => handleSearchResultClick(result.link)}
                        className="search-result-item flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-brand-light transition-colors duration-200 group mb-1"
                      >
                        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-brand-light group-hover:bg-white transition-colors duration-200">
                          <Image
                            src={result.icon}
                            alt={result.title}
                            width={20}
                            height={20}
                            className="opacity-70 group-hover:opacity-100 transition-opacity"
                          />
                        </div>

                        <div className="flex-1">
                          <p className="text-base font-semibold text-gray-800 group-hover:text-brand transition-colors">
                            {result.title}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Image
                              src={result.categoryIcon}
                              alt={result.category}
                              width={12}
                              height={12}
                              className="opacity-60"
                            />
                            {result.category}
                          </p>
                        </div>

                        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-brand-light opacity-0 group-hover:opacity-100 transition-all duration-200">
                          <span className="text-brand text-xs">→</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              </div>
            </div>

            {/* Refresh All Data */}
            <Tooltip title={isRefreshing ? "Refreshing..." : "Refresh All Data"}>
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-lg
                bg-gray-50 hover:bg-brand-light border border-gray-200 hover:border-brand/30
                transition-all duration-200 shadow-sm
                ${isRefreshing ? "cursor-wait opacity-70" : "cursor-pointer hover:scale-105"}`}
                onClick={isRefreshing ? undefined : handleGlobalRefresh}
              >
                <ReloadOutlined
                  spin={isRefreshing}
                  className="text-gray-500 hover:text-brand text-lg transition-colors duration-200"
                />
              </div>
            </Tooltip>

            {/* User Dropdown */}
            <Dropdown
              menu={{
                items: userItems,
                selectedKeys: [
                  ...(isProfileActive ? ["profile"] : []),
                  ...(isDashboardActive ? ["dashboard"] : []),
                ],
              }}
              placement="bottomRight"
              overlayClassName="user-profile-dropdown"
            >
              <div
                className="w-10 h-10 flex items-center justify-center rounded-lg
                  bg-brand hover:bg-brand-dark
                  cursor-pointer transition-all duration-200 hover:scale-105
                  shadow-sm hover:shadow-md mr-8"
              >
                <UserOutlined className="text-white text-lg" />
              </div>
            </Dropdown>
          </div>
        </>
      ) : (
        <div className="flex justify-end flex-shrink-0">
          <Button
            icon={<LoginOutlined className="text-base" />}
            onClick={() => router.push("/login")}
            className="headlessbutton h-10 px-6 border-0 font-semibold rounded-lg text-base
              transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
          >
            Login
          </Button>
        </div>
      )}
    </Layout.Header>
  );
}
