"use client";

import { Composer } from "@/app/lib/definitions";
import { PencilIcon } from "@heroicons/react/16/solid";

import { Location } from "@/app/lib/definitions";

export default function ComposerLocations({
  composer,
}: {
  composer: Composer;
}) {
  return (
    <div>
      <div className="mb-8">
        <h2 className="mb-2 text-xl">Locations</h2>
        <ul>
          {composer.locations.map((location) => {
            return <LocationItem location={location} key={location.id} />;
          })}
        </ul>
      </div>
    </div>
  );
}

function LocationItem({ location }: { location: Location }) {
  function handleEdit() {
    console.log("Edit location", location.id);
  }
  return (
    <li>
      <div className="grid grid-cols-5">
        <div className="col-span-1 pl-3">
          <strong>
            {location.start_date.getFullYear()}
            {location.start_date.getFullYear() !==
            location.end_date.getFullYear()
              ? " - " + location.end_date.getFullYear() + ":"
              : ":"}
          </strong>
        </div>
        <div className="col-span-3">
          {location.city.name}
          {" ("}
          {location.reason}
          {"), "}
          {location.description}
        </div>
        <button className="col-span-1 flex items-center" onClick={handleEdit}>
          <PencilIcon className="h-5 w-5 mr-2" />
        </button>
      </div>
    </li>
  );
}
