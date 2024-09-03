import { lusitana } from "@/app/ui/fonts";
import ComposerTable from "@/app/ui/database/composer-table";

export default async function Page() {
  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        List of Composers
      </h1>
      <div>
        <ComposerTable></ComposerTable>
      </div>
    </main>
  );
}
