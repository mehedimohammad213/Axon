// components/ui/NavItems.js

import {
  SearchOutlined,
  LoginOutlined,
  UserOutlined,
  DeploymentUnitOutlined,
  ReloadOutlined,
  MenuOutlined,
  CloseOutlined,
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
  showMenuButton = false,
  mobileMenuOpen = false,
  onMenuToggle,
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
      className="flex h-16 w-full items-center justify-between gap-2 bg-transparent px-0"
    >
      <div className="flex min-w-0 items-center gap-2 sm:gap-4 md:gap-8">
        {showMenuButton && (
          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            onClick={onMenuToggle}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-700"
          >
            {mobileMenuOpen ? (
              <CloseOutlined className="text-base" />
            ) : (
              <MenuOutlined className="text-base" />
            )}
          </button>
        )}
        <div
          className="relative h-8 w-[92px] shrink-0 cursor-pointer sm:w-[140px]"
          onClick={() => router.push("/")}
        >
          <Image
            src="/images/ui/headless_logo.svg"
            alt="Headless Logo"
            layout="fill"
            objectFit="contain"
            objectPosition="left"
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
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* Search Bar - Desktop only on larger screens */}
            <div className="hidden xl:flex items-center gap-2 mr-2">
              <div className="relative" ref={searchRef}>
              <Input
                placeholder="Search..."
                prefix={<SearchOutlined className="text-gray-400 text-base" />}
                className="h-10 w-64 rounded-lg border-gray-200 text-base
                  focus:border-brand hover:border-brand xl:w-80 2xl:w-[28rem]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowSearchResults(true)}
              />

              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="search-results-dropdown absolute right-0 top-12 z-50 max-h-96 w-[min(24rem,calc(100vw-2rem))] overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
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
                className={`hidden h-10 w-10 items-center justify-center rounded-lg sm:flex
                border border-gray-200 bg-gray-50 shadow-sm transition-all duration-200
                hover:border-brand/30 hover:bg-brand-light
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
                  shadow-sm hover:shadow-md"
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
