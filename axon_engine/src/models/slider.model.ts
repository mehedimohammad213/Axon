export const SLIDER_TABLE = 'sliders';

export interface Slider {
  id: number;
  organization_id: number | null;
  media_ids?: any;
  card_ids?: any;
  additional?: any;
  created_at: Date;
  updated_at: Date;
  [key: string]: any;
}

export interface CreateSliderInput {
  [key: string]: any;
}

export interface UpdateSliderInput {
  [key: string]: any;
}
