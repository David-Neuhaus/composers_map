import AddCity from "@/app/ui/database/add-city";
import { lusitana } from "@/app/ui/fonts";

export default async function Page({
  params,
}: {
  params: { redirect: string };
}) {
  const { redirect } = params;
  return (
    <main className="p-8">
      <h1 className={`${lusitana.className} mb-8 text-2xl md:text-3xl`}>
        Add City
      </h1>
      <div className="grid grid-cols-3">
        <div className="col-span-1">
          <AddCity redirect={redirect} />
        </div>
        <div className="col-span-3"></div>
      </div>
    </main>
  );
}
