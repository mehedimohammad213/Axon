export interface TrashItem {
  id: number;
  type: string;
  type_label: string;
  title: string;
  deleted_at: string | Date;
  created_at?: string | Date;
  updated_at?: string | Date;
}

export interface TrashListQuery {
  type?: string;
}
