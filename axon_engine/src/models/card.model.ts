export const CARD_TABLE = 'cards';

export interface Card {
  id: number;
  organization_id: number | null;
  media_ids?: any;
  additional?: any;
  created_at: Date;
  updated_at: Date;
  [key: string]: any;
}

export interface CreateCardInput {
  [key: string]: any;
}

export interface UpdateCardInput {
  [key: string]: any;
}
