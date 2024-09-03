import { lusitana } from "@/app/ui/fonts";
import { fetchComposerById } from "@/app/lib/data";

export default async function ComposerDetail({ id }: { id: string }) {
  const composer = await fetchComposerById(id);
  return (
    <div>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        {composer.name}
      </h1>
      <div>
        <p>
          <strong>Birth:</strong> {composer.birthDate.getFullYear()} {" - "}
          {composer.birthplace.name}
        </p>
        <p>
          <strong>Death:</strong> {composer.deathDate.getFullYear()} {" - "}
          {composer.deathplace.name}
        </p>
        <ul>
          {composer.locations.map((location) => {
            return (
              <li key={location.id}>
                <strong>
                  {location.start_date.getFullYear()} {" - "}{" "}
                  {location.end_date.getFullYear()}:
                </strong>{" "}
                {location.city.name}
                {" ("}
                {location.reason}
                {"), "}
                {location.description}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
