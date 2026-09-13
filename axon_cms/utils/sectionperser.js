import syncLinkedHeadless from "../../components/PageBuilder/utils/syncLinkedHeadless";

const bodyParser = (body) => {
  const synced = syncLinkedHeadless(body);
  return synced.body;
};

export default bodyParser;
