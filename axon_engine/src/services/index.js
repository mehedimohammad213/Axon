const AuthService = require('./AuthService');
const UserService = require('./UserService');
const OrganizationService = require('./OrganizationService');
const RoleService = require('./RoleService');
const PermissionService = require('./PermissionService');
const PageService = require('./PageService');
const MediaService = require('./MediaService');
const CardService = require('./CardService');
const TableService = require('./TableService');
const FooterService = require('./FooterService');
const MenuItemService = require('./MenuItemService');
const FormService = require('./FormService');
const FormDataService = require('./FormDataService');
const FormSubmissionService = require('./FormSubmissionService');
const GeneratedModelService = require('./GeneratedModelService');
const DynamicService = require('./DynamicService');
const { createCrudService } = require('./CrudService');

module.exports = {
  AuthService,
  UserService,
  OrganizationService,
  RoleService,
  PermissionService,
  PageService,
  MediaService,
  CardService,
  TableService,
  FooterService,
  MenuItemService,
  FormService,
  FormDataService,
  FormSubmissionService,
  GeneratedModelService,
  DynamicService,
  createCrudService,
};
