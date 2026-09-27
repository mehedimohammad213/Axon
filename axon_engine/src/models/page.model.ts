export const PAGE_TABLE = 'pages';

export const PAGE_LIST_COLUMNS = [
  'id', 'organization_id', 'slug', 'type', 'favicon_id',
  'page_name_en', 'page_name_bn', 'head', 'status', 'created_at', 'updated_at',
] as const;

export interface Page {
  id: number;
  organization_id: number | null;
  slug: string | null;
  type: string | null;
  favicon_id: string | number | null;
  page_name_en: string | null;
  page_name_bn: string | null;
  head: any;
  body: any;
  body_raw: any;
  additional: any;
  status: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePageInput {
  slug?: string;
  type?: string;
  favicon_id?: string | number | null;
  page_name_en: string;
  page_name_bn?: string | null;
  head?: any;
  body?: any;
  additional?: any;
  status?: boolean;
}

export interface UpdatePageInput extends CreatePageInput {}
