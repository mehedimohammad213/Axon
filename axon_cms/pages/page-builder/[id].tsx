// pages/page-builder/[id].js

import React from "react";
import { useRouter } from "next/router";
import PageBuilder from "../../components/PageBuilder/PageBuilder";

const PageBuilderPage = () => {
  const router = useRouter();
  const { id, edit } = router.query;

  // Ensure the page ID is available before rendering
  if (!id) {
    return <div>Loading...</div>;
  }

  return (
    <div className="page-builder-shell w-full px-0 pb-28 pt-4 sm:pb-32 lg:pt-6">
      <PageBuilder pageId={id} editMode={edit === "true"} />
    </div>
  );
};

export default PageBuilderPage;
