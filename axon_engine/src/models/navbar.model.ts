export const NAVBAR_TABLE = 'navbars';

export interface Navbar {
  id: number;
  organization_id: number | null;
  title_en: string | null;
  logo_id: string | number | null;
  menu_item_ids: any;
  created_at: Date;
  updated_at: Date;
  [key: string]: any;
}

export interface CreateNavbarInput {
  title_en: string;
  logo_id: string | number;
  menu_item_ids: any;
  [key: string]: any;
}

export interface UpdateNavbarInput {
  title_en?: string;
  logo_id?: string | number;
  menu_item_ids?: any;
  [key: string]: any;
}
