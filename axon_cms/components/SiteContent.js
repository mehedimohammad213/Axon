import React, { useEffect, useState } from "react";
import { Image, Layout, Button, Modal, message } from "antd";
import { useRouter } from "next/router";
import NavItems from "./ui/NavItems";
import SideMenuItems from "./ui/SideMenuItems";
import Loader from "./Loader";
import { useAuth } from "../src/context/AuthContext";
import { useMenuRefresh } from "../src/context/MenuRefreshContext";
import { publicPages, allowSignup, isProtectedPage } from "../config/routes";
import { canAccessRoute } from "../utils/permissions";

const { Sider, Content, Header } = Layout;

const SiteContent = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const [isMobile, setIsMobile] = useState(false);
  const { user, token, organization, logout, loading } = useAuth();
  const router = useRouter();
  const currentRoute = router.pathname;
  const { refreshMenu } = useMenuRefresh();

  // State for login modal (optional, can be removed if not needed)
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Determine if the current page is public or protected
  const isPublicPage = publicPages.includes(currentRoute);
  const isProtected = isProtectedPage(currentRoute);

  useEffect(() => {}, [allowSignup]);

  useEffect(() => {
    setMobileOpen(false);
  }, [currentRoute]);

  useEffect(() => {
    document.body.style.overflow = isMobile && mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, mobileOpen]);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 1024);

      if (width >= 1024) {
        setMobileOpen(false);
      }
      if (width >= 1440) {
        setCollapsed(false);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Theme initialization
    try {
      const storedTheme = localStorage.getItem("darkmode");
      if (storedTheme) {
        setTheme(storedTheme === "true" ? "dark" : "light");
      }
    } catch (error) {
      console.warn("localStorage is not available. Using default theme.");
    }

    const handleThemeChange = () => {
      try {
        const updatedTheme = localStorage.getItem("darkmode");
        if (updatedTheme) {
          setTheme(updatedTheme === "true" ? "dark" : "light");
        }
      } catch (error) {
        console.warn("localStorage is not available. Theme not updated.");
      }
    };

    window.addEventListener("storage", handleThemeChange);
    return () => window.removeEventListener("storage", handleThemeChange);
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (isProtected && !token) {
      // Redirect to login if the page is protected and the user is not authenticated
      router.push("/login");
    } else if (
      isPublicPage &&
      token &&
      currentRoute !== "/portfolio"
    ) {
      // Redirect to home if the user is authenticated and tries to access a public page
      router.push("/");
    } else if (currentRoute === "/signup" && !allowSignup) {
      // Redirect to login if signup is not allowed
      router.push("/login");
      message.info("Signup is not allowed at this time.");
    } else if (token && user && !canAccessRoute(user, currentRoute)) {
      router.push("/");
      message.error("You do not have permission to access this page.");
    }
  }, [
    token,
    user,
    loading,
    currentRoute,
    router,
    isProtected,
    isPublicPage,
    allowSignup,
  ]);

  const handleCollapse = () => {
    setCollapsed(!collapsed);
  };

  // Don't show loader for page-builder pages
  if (loading && !currentRoute.includes("/page-builder")) return <Loader />;

  if (isPublicPage) {
    // Render public pages without layout
    return <Content className="min-h-screen">{children}</Content>;
  }

  // Determine if the sidebar should be displayed
  const shouldShowSidebar = token && isProtected;

  // Calculate dynamic widths for better responsiveness
  const sidebarWidth = collapsed ? 80 : 260;
  const contentMargin = shouldShowSidebar ? sidebarWidth : 0;

  return (
    <Layout className="min-h-screen overflow-x-hidden bg-surface">
      {/* Fixed Header */}
      <Header
        className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md flex
      items-center px-3 sm:px-4 md:px-6 lg:px-8 h-16"
      >
        <NavItems
          user={user}
          token={token}
          organization={organization}
          handleLogout={logout}
          theme={theme}
          setTheme={setTheme}
          showMenuButton={shouldShowSidebar && isMobile}
          mobileMenuOpen={mobileOpen}
          onMenuToggle={() => setMobileOpen((open) => !open)}
        />
      </Header>

      <Layout className="bg-surface pt-16">
        {shouldShowSidebar && isMobile && mobileOpen && (
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 top-16 z-30 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {shouldShowSidebar && (
          <div
            className={`fixed top-[calc(var(--header-height)+var(--shell-gap))] bottom-[calc(var(--footer-height)+var(--shell-gap))] left-[var(--shell-gap)] z-40 transition-transform duration-300 ${
              isMobile
                ? mobileOpen
                  ? "translate-x-0"
                  : "-translate-x-full"
                : "translate-x-0"
            }`}
          >
            <Sider
              collapsible
              collapsed={isMobile ? false : collapsed}
              onCollapse={handleCollapse}
              theme={theme}
              width={260}
              style={{
                height: "100%",
                minHeight: "100%",
                maxHeight: "100%",
              }}
              className="overflow-hidden rounded-2xl bg-white px-2
                shadow-lg [&_.ant-layout-sider-children]:flex [&_.ant-layout-sider-children]:h-full [&_.ant-layout-sider-children]:min-h-0 [&_.ant-layout-sider-children]:flex-col"
              collapsedWidth={isMobile ? 0 : 80}
              trigger={null}
            >
              <div className="flex h-full min-h-0 w-full flex-1 flex-col py-2">
                <SideMenuItems
                  token={token}
                  user={user}
                  handleLogout={logout}
                  setIsModalOpen={setIsModalOpen}
                  collapsed={isMobile ? false : collapsed}
                  theme={theme}
                  setTheme={setTheme}
                />
              </div>
            </Sider>
          </div>
        )}

        {/* Main Content Area */}
        <Layout
          className="min-h-[calc(100vh-4rem)] bg-surface transition-all duration-300 ease-in-out"
          style={{
            marginLeft:
              shouldShowSidebar && !isMobile
                ? `calc(${contentMargin}px + var(--shell-gap))`
                : 0,
            marginRight: 0,
            width: "auto",
            maxWidth: "100%",
            boxSizing: "border-box",
          }}
        >
          {/* Conditionally render the Collapse Button */}
          {shouldShowSidebar && !isMobile && (
            <div
              className="hidden lg:flex fixed top-[calc(var(--header-height)+var(--shell-gap)+0.5rem)] z-40 transition-all duration-300"
              style={{
                left: collapsed
                  ? "calc(var(--shell-gap) + 52px)"
                  : "calc(var(--shell-gap) + 235px)",
              }}
            >
              <Image
                src={
                  collapsed
                    ? "/icons/headless_icons/expand.svg"
                    : "/icons/headless_icons/collapse.svg"
                }
                alt={collapsed ? "Expand" : "Collapse"}
                width={40}
                height={40}
                preview={false}
                className="cursor-pointer collapse-button border-0 transition-all duration-300 hover:scale-110"
                onClick={handleCollapse}
              />
            </div>
          )}

          <Content
            className="min-h-[calc(100vh-var(--header-height))] bg-surface"
            style={{
              width: "100%",
              maxWidth: "100%",
              padding: 0,
              boxSizing: "border-box",
            }}
          >
            {/* Content wrapper */}
            <div
              className="min-w-0 overflow-x-hidden"
              style={{ width: "100%", height: "100%", boxSizing: "border-box" }}
            >
              {children}
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default SiteContent;
