import syncLinkedHeadless from "./syncLinkedHeadless";
import { syncLinkedForms } from "./syncLinkedForms";

export const syncPageLinkedData = async (pageData, fetchForms) => {
  const withHeadless = syncLinkedHeadless(pageData);
  return syncLinkedForms(withHeadless, fetchForms);
};

export default syncPageLinkedData;
