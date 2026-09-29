import { useEffect } from "react";
import { useRouter } from "next/router";

const FormResponses = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/formbuilder/form-responses");
  }, [router]);

  return null;
};

export default FormResponses;
