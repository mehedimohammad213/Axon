import { db } from '../db';
import { createModel } from './BaseModel';

const base = createModel('generated_models');

async function generate({
  modelSingular,
  modelPlural,
  fields,
  status,
}: {
  modelSingular: string;
  modelPlural: string;
  fields: Record<string, any>[];
  status?: boolean;
}) {
  const tableName = modelPlural.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  const apiRoute = `/api/dynamic?model=${tableName}`;

  const model = await base.create({
    model_name: modelSingular,
    fields: JSON.stringify(fields),
    status: status !== undefined ? status : false,
    api_route: apiRoute,
  });

  const exists = await db.tableExists(tableName);
  if (!exists) {
    await db.createDynamicTable(tableName, fields as any);
  }

  return { model, tableName, apiRoute };
}

async function updateGeneratedModel(
  id: number | string,
  { model_name, fields, status, api_route }: Record<string, any>,
  existing: Record<string, any>
) {
  return base.update(id, {
    model_name: model_name ?? existing.model_name,
    fields: fields ? JSON.stringify(fields) : existing.fields,
    status: status !== undefined ? status : existing.status,
    api_route: api_route ?? existing.api_route,
  });
}

async function deleteWithTable(id: number | string) {
  const model = await base.findById(id);
  if (!model) return null;

  const tableName = model.api_route?.match(/model=([^&]+)/)?.[1];
  if (tableName && (await db.tableExists(tableName))) {
    await db.dropTableIfExists(tableName);
  }

  await base.remove(id);
  return model;
}

export default {
  ...base,
  generate,
  updateGeneratedModel,
  deleteWithTable,
};
