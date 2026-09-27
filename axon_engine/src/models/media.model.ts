export const MEDIA_TABLE = 'media';

export interface Media {
  id: number;
  organization_id: number | null;
  title: string | null;
  file_name: string | null;
  file_type: string | null;
  file_path: string | null;
  file_size: number | null;
  tags: string[] | string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface UpdateMediaInput {
  title?: string;
  file_name?: string;
  tags?: unknown;
}

export interface MediaPageviewQuery {
  count?: string;
  order_type?: string;
  keyword?: string;
  page?: string;
}
