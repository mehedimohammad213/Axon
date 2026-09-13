const ROUTE_PERMISSIONS = {
  "/": "view_dashboard",
  "/gallery": "view_gallery",
  "/menuitems": "view_menu_items",
  "/navbars": "view_navbars",
  "/cards": "view_components",
  "/sliders": "view_sliders",
  "/tables": "view_components",
  "/products": "view_components",
  "/products/types": "view_components",
  "/products/upload": "view_components",
  "/products/create-type": "view_components",
  "/products/edit-type": "view_components",
  "/footers": "view_footers",
  "/pages": "view_pages",
  "/formbuilder": "access_dynamic_form_builder",
  "/formbuilder/form-responses": "view_form_responses",
  "/tools": "access_doc_to_api",
  "/settings/users-settings": "view_users",
  "/settings/user-registration": "view_users",
  "/settings/access-control": "view_users",
  "/settings/role-permission": "create_roles",
  "/admin/organizations": "manage_organizations",
  "/admin/organizations/[id]": "manage_organizations",
  "/admin/users": "view_users",
  "/admin/roles": "manage_organizations",
};

export function isSuperAdmin(user) {
  if (!user) {
    return false;
  }

  if (user.is_super_admin) {
    return true;
  }

  const role = user?.role_headless;
  const permissions = role?.permission_headless || [];

  return permissions.some(
    (permission) =>
      permission?.slug === "admin_all" && permission?.status !== 0
  );
}

export function isPlatformSuperAdmin(user) {
  return Boolean(user?.is_super_admin);
}

export function canManagePlatform(user) {
  if (!user) {
    return false;
  }

  if (user.is_super_admin) {
    return true;
  }

  return hasPermission(user, "manage_organizations");
}

export function getUserPermissionSlugs(user) {
  const role = user?.role_headless;
  const permissions = role?.permission_headless || [];

  if (!permissions.length) {
    return [];
  }

  const slugs = permissions
    .filter((permission) => permission?.status !== 0)
    .map((permission) => permission.slug)
    .filter(Boolean);

  if (slugs.includes("admin_all")) {
    return ["admin_all", ...Object.values(ROUTE_PERMISSIONS)];
  }

  return slugs;
}

export function hasPermission(user, slug) {
  if (!slug) {
    return true;
  }

  if (user?.is_super_admin) {
    return true;
  }

  const slugs = getUserPermissionSlugs(user);

  if (slugs.includes("admin_all")) {
    return true;
  }

  return slugs.includes(slug);
}

export function hasAnyPermission(user, requiredSlugs = []) {
  if (!requiredSlugs.length) {
    return true;
  }

  return requiredSlugs.some((slug) => hasPermission(user, slug));
}

const SUPER_ADMIN_ONLY_MENU_TITLES = ["Administration", "E-Labs"];

const SUPER_ADMIN_ONLY_ROUTE_PREFIXES = [
  "/admin/",
  "/diy-cms",
  "/doc-to-api",
  "/build-with-ai",
];

export function isSuperAdminOnlyRoute(link) {
  if (!link) {
    return false;
  }

  return SUPER_ADMIN_ONLY_ROUTE_PREFIXES.some((prefix) => link.startsWith(prefix));
}

export function canAccessRoute(user, link) {
  if (!link) {
    return true;
  }

  if (isSuperAdminOnlyRoute(link)) {
    return isPlatformSuperAdmin(user);
  }

  let permission = ROUTE_PERMISSIONS[link];

  if (!permission) {
    return true;
  }

  return hasPermission(user, permission);
}

export function filterMenuByPermissions(menuItems, user) {
  if (!user) {
    return menuItems;
  }

  return menuItems
    .map((item) => {
      if (
        SUPER_ADMIN_ONLY_MENU_TITLES.includes(item.title) &&
        !isPlatformSuperAdmin(user)
      ) {
        return null;
      }

      if (item.submenu?.length) {
        const submenu = item.submenu.filter((subItem) =>
          canAccessRoute(user, subItem.link)
        );

        if (!submenu.length) {
          return null;
        }

        return { ...item, submenu };
      }

      return canAccessRoute(user, item.link) ? item : null;
    })
    .filter(Boolean);
}

export { ROUTE_PERMISSIONS };
