import Editor from "@/components/spill/Editor";
import { Button } from "@/components/ui/Button";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

interface pageProps {
  params: {
    slug: string;
  };
}

const Page = async ({ params }: pageProps) => {
  const { slug } = params;
  const company = await db.company.findFirst({
    where: {
      name: slug,
    },
  });

  if (!company) return notFound();

  return (
    <div className="flex flex-col items-start gap-6">
      <div className="border-b border-gray-200 pb-5">
        <div className="-ml-2 -mt-2 flex flex-wrap items-baseline">
          <h3 className="ml-2 mt-2 text-base font-semibold leading-6 text-gray-900">
            Spill some tea
          </h3>
          <p className="ml-2 mt-1 truncate text-sm text-gray-500">
            on {params.slug}
          </p>
        </div>
      </div>

      {/* FORM */}
      <Editor companyId={company.id} />

      <div className="w-full flex justify-end">
        <Button type="submit" className="w-full" form="company-spill-form">
          Spill
        </Button>
      </div>
    </div>
  );
};

export default Page;
