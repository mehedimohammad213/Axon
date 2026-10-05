import AppError from '../utils/AppError';
import OrganizationContext from '../context/organizationContext';
import PageRepository from '../repositories/page.repository';
import TableRepository from '../repositories/table.repository';
import { validateCreateTableBody, validateUpdateTableBody } from '../validators/table.validator';
import type { CreateTableInput, UpdateTableInput } from '../models/table.model';

function parseMaybe(value: unknown) {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function componentType(component: Record<string, any>) {
  if (!component?.type) return null;
  return typeof component.type === 'object' ? component.type.type || null : component.type;
}

function walkComponents(nodes: unknown, visit: (component: Record<string, any>) => void) {
  if (!Array.isArray(nodes)) return;
  for (const node of nodes) {
    if (!node || typeof node !== 'object') continue;
    visit(node);
    if (Array.isArray(node.data)) walkComponents(node.data, visit);
  }
}

function contentKey(headers: unknown, rows: unknown) {
  return JSON.stringify([headers, rows]);
}

function sourceKey(pageId: unknown, componentId: unknown) {
  return `${pageId}:${componentId}`;
}

/**
 * Older pages store table rows inside the page body instead of the tables
 * collection. Copy those into tables so the Tables page can list them.
 */
async function syncEmbeddedPageTables() {
  if (!OrganizationContext.get() || OrganizationContext.isBypassed()) return;

  const existing = await TableRepository.findAll();
  const known = new Set<string>();

  for (const table of existing) {
    const additional = (parseMaybe(table.additional) || {}) as Record<string, unknown>;
    if (additional.source_page_id != null && additional.source_component_id != null) {
      known.add(sourceKey(additional.source_page_id, additional.source_component_id));
    }
    known.add(contentKey(parseMaybe(table.headers), parseMaybe(table.rows)));
  }

  const pages = await PageRepository.query().select(
    'id',
    'page_name_en',
    'page_name_bn',
    'slug',
    'body'
  );

  const pending: Record<string, unknown>[] = [];

  for (const page of pages) {
    const body = parseMaybe(page.body);
    let index = 0;

    walkComponents(body, (component) => {
      if (componentType(component) !== 'table') return;

      const headless = (component._headless || {}) as Record<string, any>;
      const headers = parseMaybe(headless.headers);
      const rows = parseMaybe(headless.rows);
      if (!Array.isArray(headers) || headers.length === 0) return;
      if (rows != null && !Array.isArray(rows)) return;

      const componentId = component.id || component._id;
      if (!componentId) return;

      const linked = sourceKey(page.id, componentId);
      const signature = contentKey(headers, rows || []);
      if (known.has(linked) || known.has(signature)) return;

      const pageName = page.page_name_en || page.slug || 'Page';
      const hint = String(headers[0] || `Table ${index + 1}`).replace(/_/g, ' ');
      const title = headless.title_en || `${pageName} · ${hint}`;

      known.add(linked);
      known.add(signature);
      index += 1;

      pending.push({
        title_en: title,
        title_bn: headless.title_bn || page.page_name_bn || title,
        page_name: headless.page_name || pageName,
        headers,
        rows: rows || [],
        visible_columns:
          headless.visibleColumns ||
          headless.visible_columns ||
          headers.map(() => true),
        filter_columns: headless.filterColumns || headless.filter_columns || [],
        additional: {
          source_page_id: page.id,
          source_component_id: componentId,
        },
        status: headless.status !== false,
      });
    });
  }

  for (const payload of pending) {
    await TableRepository.create(payload);
  }
}

async function list({ page, limit }: { page?: number; limit?: number } = {}) {
  await syncEmbeddedPageTables();
  return TableRepository.findPaginated({ page, limit });
}

async function show(id: any) {
  const table = await TableRepository.findById(id);
  if (!table) throw new AppError(404, 'Table not found');
  return table;
}

async function create(body: CreateTableInput) {
  return TableRepository.create(validateCreateTableBody(body));
}

async function update(id: any, body: UpdateTableInput) {
  const table = await TableRepository.findById(id);
  if (!table) throw new AppError(404, 'Table not found');
  return TableRepository.update(id, validateUpdateTableBody(body));
}

async function remove(id: any) {
  const table = await TableRepository.findById(id);
  if (!table) throw new AppError(404, 'Table not found');
  await TableRepository.remove(id);
  return 'Table';
}

export default {
  list,
  show,
  create,
  update,
  remove,
};
export { list, show, create, update, remove };
