const { createModel } = require('./BaseModel');

const NavbarModel = createModel('navbars');
const MenuModel = createModel('menus', { jsonFields: ['menu_item_ids'] });
const FormBuilderModel = createModel('form_builder', { jsonFields: ['attributes', 'elements', 'additional'] });

const UserModel = require('./UserModel');
const OrganizationModel = require('./OrganizationModel');
const RoleModel = require('./RoleModel');
const PermissionModel = require('./PermissionModel');
const PageModel = require('./PageModel');
const MediaModel = require('./MediaModel');
const CardModel = require('./CardModel');
const SliderModel = require('./SliderModel');
const TableModel = require('./TableModel');
const ProductTypeModel = require('./ProductTypeModel');
const ProductModel = require('./ProductModel');
const FooterModel = require('./FooterModel');
const MenuItemModel = require('./MenuItemModel');
const FormModel = require('./FormModel');
const FormDataModel = require('./FormDataModel');
const FormSubmissionModel = require('./FormSubmissionModel');
const GeneratedModelModel = require('./GeneratedModelModel');
const DynamicModel = require('./DynamicModel');

module.exports = {
  createModel,
  NavbarModel,
  MenuModel,
  SliderModel,
  FormBuilderModel,
  UserModel,
  OrganizationModel,
  RoleModel,
  PermissionModel,
  PageModel,
  MediaModel,
  CardModel,
  TableModel,
  ProductTypeModel,
  ProductModel,
  FooterModel,
  MenuItemModel,
  FormModel,
  FormDataModel,
  FormSubmissionModel,
  GeneratedModelModel,
  DynamicModel,
};
