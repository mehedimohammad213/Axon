export const FOOTER_TABLE = 'footers';

export const FOOTER_MENU_ITEM_FIELDS = [
  'column2_menu_item_ids',
  'column3_menu_item_ids',
  'column4_menu_item_ids',
  'bottom_menu_item_ids',
] as const;

export interface Footer {
  id: number;
  organization_id: number | null;
  title_en: string | null;
  title_bn?: string | null;
  logo_id?: string | number | null;
  column3_logos?: any;
  created_at: Date;
  updated_at: Date;
  [key: string]: any;
}

export interface CreateFooterInput {
  title_en: string;
  [key: string]: any;
}

export interface UpdateFooterInput {
  title_en?: string;
  [key: string]: any;
}
