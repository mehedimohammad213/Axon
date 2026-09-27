import AppError from '../utils/AppError';
import NavbarRepository from '../repositories/navbar.repository';
import { validateCreateNavbarBody, validateUpdateNavbarBody } from '../validators/navbar.validator';
import type { CreateNavbarInput, UpdateNavbarInput } from '../models/navbar.model';

async function list({ page, limit }: { page?: number; limit?: number } = {}) {
  return NavbarRepository.findAllWithRelationsPaginated({ page, limit });
}

async function show(id: any) {
  const navbar = await NavbarRepository.findByIdWithRelations(id);
  if (!navbar) throw new AppError(404, 'Navbar not found');
  return navbar;
}

async function create(body: CreateNavbarInput) {
  return NavbarRepository.createNavbar(validateCreateNavbarBody(body));
}

async function update(id: any, body: UpdateNavbarInput) {
  const navbar = await NavbarRepository.findById(id);
  if (!navbar) throw new AppError(404, 'Navbar not found');

  return NavbarRepository.updateNavbar(id, validateUpdateNavbarBody(body));
}

async function remove(id: any) {
  const navbar = await NavbarRepository.findById(id);
  if (!navbar) throw new AppError(404, 'Navbar not found');

  await NavbarRepository.remove(id);
  return 'Navbar';
}

export default {
  list,
  show,
  create,
  update,
  remove,
};
export { list, show, create, update, remove };
