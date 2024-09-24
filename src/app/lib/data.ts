import postgres from "postgres";

import {
  City,
  CityDb,
  Composer,
  ComposerTable,
  ComposerWithCitiesDb,
  Location,
  LocationWithCityDb,
} from "./definitions";

export const sql = postgres({
  // debug: true,
});

export async function fetchLocationsByComposerId(
  id: string
): Promise<Location[]> {
  const data = await sql<LocationWithCityDb[]>`
    SELECT 
      l.id,
      l.composer_id,
      l.city_id,
      c.name as city_name,
      c.latitude as city_latitude,
      c.longitude as city_longitude,
      l.start_date,
      l.end_date,
      l.reason,
      l.description
    FROM locations l
    INNER JOIN cities c
      ON l.city_id = c.id
    
    WHERE l.composer_id = ${id}
    ORDER BY l.start_date;
  `;

  return data.map<Location>((l) => {
    return {
      id: l.id,
      composer_id: id,
      city: {
        id: l.city_id,
        name: decodeURIComponent(l.city_name),
        coordinates: {
          latitude: l.city_latitude,
          longitude: l.city_longitude,
        },
      },
      start_date: l.start_date,
      end_date: l.end_date,
      description: decodeURIComponent(l.description),
      reason: l.reason,
    };
  });
}

export async function fetchComposerById(id: string): Promise<Composer> {
  const composerData = await sql<ComposerWithCitiesDb[]>`
    SELECT 
      c.id,
      c.name,
      c.birthDate,
      bc.id as birthplace_id,
      bc.name as birthplace_name,
      bc.latitude as birthplace_latitude,
      bc.longitude as birthplace_longitude,
      c.deathDate,
      dc.id as deathplace_id,
      dc.name as deathplace_name,
      dc.latitude as deathplace_latitude,
      dc.longitude as deathplace_longitude
    FROM composers c
    INNER JOIN cities bc
      ON c.birthplace = bc.id
    INNER JOIN cities dc
      ON c.deathplace = dc.id
    WHERE c.id = ${id};
    `;

  if (composerData.count === 0) {
    return Promise.reject("Composer not found.");
  }

  const composer: Composer = {
    id: composerData[0].id,
    name: decodeURIComponent(composerData[0].name),
    birthDate: composerData[0].birthdate,
    birthplace: {
      id: composerData[0].birthplace_id,
      name: decodeURIComponent(composerData[0].birthplace_name),
      coordinates: {
        latitude: composerData[0].birthplace_latitude,
        longitude: composerData[0].birthplace_longitude,
      },
    },
    deathDate: composerData[0].deathdate,
    deathplace: {
      id: composerData[0].deathplace_id,
      name: decodeURIComponent(composerData[0].deathplace_name),
      coordinates: {
        latitude: composerData[0].deathplace_latitude,
        longitude: composerData[0].deathplace_longitude,
      },
    },
    locations: await fetchLocationsByComposerId(id),
  };

  return composer;
}

export async function fetchComposerTable(): Promise<ComposerTable> {
  const data = await sql<ComposerWithCitiesDb[]>`
    SELECT 
      c.id,
      c.name,
      c.birthdate,
      bc.id as birthplace_id,
      bc.name as birthplace_name,
      bc.latitude as birthplace_latitude,
      bc.longitude as birthplace_longitude,
      c.deathdate,
      dc.id as deathplace_id,
      dc.name as deathplace_name,
      dc.latitude as deathplace_latitude,
      dc.longitude as deathplace_longitude
    FROM composers c
    INNER JOIN cities bc
      ON c.birthplace = bc.id
    INNER JOIN cities dc
      ON c.deathplace = dc.id
    ORDER BY c.birthdate, birthplace_name;
    `;

  const composers: Composer[] = await Promise.all(
    data.map(async (composerData) => {
      return {
        id: composerData.id,
        name: decodeURIComponent(composerData.name),
        birthDate: composerData.birthdate,
        birthplace: {
          id: composerData.birthplace_id,
          name: decodeURIComponent(composerData.birthplace_name),
          coordinates: {
            latitude: composerData.birthplace_latitude,
            longitude: composerData.birthplace_longitude,
          },
        },
        deathDate: composerData.deathdate,
        deathplace: {
          id: composerData.deathplace_id,
          name: decodeURIComponent(composerData.deathplace_name),
          coordinates: {
            latitude: composerData.deathplace_latitude,
            longitude: composerData.deathplace_longitude,
          },
        },
        locations: await fetchLocationsByComposerId(composerData.id),
      };
    })
  );

  return composers;
}

export async function fetchAllCities(): Promise<City[]> {
  const data = await sql<CityDb[]>`
    SELECT * FROM cities ORDER BY name;
  `;

  return data.map((city) => {
    return {
      id: city.id,
      name: decodeURIComponent(city.name),
      coordinates: {
        latitude: city.latitude,
        longitude: city.longitude,
      },
    };
  });
}
