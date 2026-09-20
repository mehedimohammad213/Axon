import AppError from '../utils/AppError';
import { createModel } from '../models/BaseModel';

interface CrudServiceOptions {
  requiredOnCreate?: string[];
  [key: string]: any;
}

function createCrudService(tableName: string, options: CrudServiceOptions = {}) {
  const model = createModel(tableName, options as any);
  const requiredOnCreate = options.requiredOnCreate || [];

  async function list({ page, limit }: { page?: number; limit?: number } = {}) {
    return model.findPaginated({ page, limit });
  }

  async function show(id: any) {
    const item = await model.findById(id);
    if (!item) throw new AppError(404, `${tableName} not found`);
    return item;
  }

  async function create(body: any) {
    for (const field of requiredOnCreate) {
      if (!body[field]) {
        throw new AppError(422, 'Validation failed', {
          [field]: [`The ${field} field is required.`],
        });
      }
    }

    return model.create(body);
  }

  async function update(id: any, body: any) {
    const item = await model.findById(id);
    if (!item) throw new AppError(404, `${tableName} not found`);

    return model.update(id, body);
  }

  async function remove(id: any) {
    const item = await model.findById(id);
    if (!item) throw new AppError(404, `${tableName} not found`);

    await model.remove(id);
    return tableName;
  }

  return { list, show, create, update, remove };
}

export default {
  createCrudService,
};
export { createCrudService };
