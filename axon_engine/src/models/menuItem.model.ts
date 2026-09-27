export const MENU_ITEM_TABLE = 'menu_items';

export interface MenuItem {
  id: number;
  organization_id: number | null;
  title: string;
  title_bn: string | null;
  link: string;
  parent_id: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateMenuItemInput {
  title: string;
  title_bn?: string | null;
  link: string;
  parent_id?: number | string | null;
}

export interface UpdateMenuItemInput {
  title: string;
  title_bn?: string | null;
  link: string;
  parent_id?: number | string | null;
}
