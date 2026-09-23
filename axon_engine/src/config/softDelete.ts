export interface TrashableResource {
  type: string;
  table: string;
  label: string;
  titleFields: string[];
}

export const SOFT_DELETE_TABLES = new Set([
  'media',
  'menu_items',
  'navbars',
  'cards',
  'sliders',
  'footers',
  'pages',
  'tables',
  'product_types',
  'products',
  'form_builder',
  'form_submissions',
  'generated_models',
]);

export const TRASHABLE_RESOURCES: TrashableResource[] = [
  { type: 'pages', table: 'pages', label: 'Page', titleFields: ['page_name_en', 'page_name_bn', 'slug'] },
  { type: 'media', table: 'media', label: 'Media', titleFields: ['title', 'file_name'] },
  { type: 'menuitems', table: 'menu_items', label: 'Menu Item', titleFields: ['title', 'title_bn'] },
  { type: 'navbars', table: 'navbars', label: 'Navbar', titleFields: ['title_en', 'title_bn'] },
  { type: 'cards', table: 'cards', label: 'Card', titleFields: ['title_en', 'title_bn', 'page_name'] },
  { type: 'sliders', table: 'sliders', label: 'Slider', titleFields: ['title_en', 'title_bn'] },
  { type: 'footers', table: 'footers', label: 'Footer', titleFields: ['title_en', 'title_bn'] },
  { type: 'tables', table: 'tables', label: 'Table', titleFields: ['title_en', 'title_bn', 'page_name'] },
  { type: 'products', table: 'products', label: 'Product', titleFields: ['title', 'slug'] },
  { type: 'product-types', table: 'product_types', label: 'Product Type', titleFields: ['name', 'slug'] },
  { type: 'form_builder', table: 'form_builder', label: 'Form', titleFields: ['title'] },
  { type: 'form-submission', table: 'form_submissions', label: 'Form Response', titleFields: ['form_type', 'status'] },
  { type: 'generated-models', table: 'generated_models', label: 'Custom Model', titleFields: ['model_name'] },
];

export function isSoftDeleteTable(tableName: string): boolean {
  return SOFT_DELETE_TABLES.has(tableName);
}

export function getTrashableResource(type: string): TrashableResource | undefined {
  return TRASHABLE_RESOURCES.find((resource) => resource.type === type);
}
