import CompanionAutoForm from "@/components/companion-form/companion-auto-form";
import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";

interface CompanionIdPageProps {}

const CompanionIdPage = async () => {
  const { userId } = auth();

  if (!userId) {
    return auth().redirectToSignIn();
  }

  const categories = await prismadb.category.findMany();

  return <CompanionAutoForm categories={categories} />;
};

export default CompanionIdPage;
