import ComposerDetail from "@/app/ui/database/composer-detail";

export default async function Page({ params }: { params: { id: string } }) {
  return (
    <main>
      <ComposerDetail id={params.id}></ComposerDetail>
    </main>
  );
}
