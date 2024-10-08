import { fetchAllCities, fetchComposerById } from "@/app/lib/data";
import AddLocation from "@/app/ui/database/add-location";
import ComposerLocations from "@/app/ui/database/composer-locations";
import { lusitana } from "@/app/ui/fonts";

export default async function Page({
  params,
}: {
  params: { id: string; selectedCity: string };
}) {
  const cities = await fetchAllCities();
  const composer = await fetchComposerById(params.id);
  return (
    <main className="p-8">
      <h1 className={`${lusitana.className} mb-8 text-2xl md:text-3xl`}>
        {composer.name}
      </h1>
      <div className="mb-4">
        <p>
          <strong>Birth:</strong> {composer.birthDate.getFullYear()} {" - "}
          {composer.birthplace.name}
        </p>
        <p>
          <strong>Death:</strong> {composer.deathDate.getFullYear()} {" - "}
          {composer.deathplace.name}
        </p>
      </div>
      <div className="grid grid-cols-3">
        <div className="col-span-1">
          <ComposerLocations composer={composer}></ComposerLocations>
          <AddLocation
            id={params.id}
            cities={cities}
            selectedCity={cities.find(
              (city) => city.id === params.selectedCity
            )}
          ></AddLocation>
        </div>
        <div className="col-span-3"></div>
      </div>
    </main>
  );
}
