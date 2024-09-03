import bcrypt from "bcrypt";
import fs from "node:fs";

import parser from "csv-parser";
import { randomUUID } from "node:crypto";

import { City, ComposerDb, User } from "@/app/lib/definitions";
import { deepEqual, pointToCoord } from "@/app/lib/utils";
import { sql } from "@/app/lib/data";

type ComposerRaw = {
  id: string;
  name: string;
  birthplace: string;
  coordsBirth: string;
  birthDate: string;
  deathplace: string;
  coordsDeath: string;
  deathDate: string;
};

const processInputFiles = async (): Promise<[ComposerDb[], City[]]> => {
  const cities: City[] = await processCitiesFile(
    "/home/mad/local/composers_map/src/app/seed/cities_data1.csv"
  );
  const composers: ComposerDb[] = [];
  const composersRaw: ComposerRaw[] = await processComposersFile(
    "/home/mad/local/composers_map/src/app/seed/composers_data1.csv"
  );

  function checkBirthCity(birthplace: string, birthCoords: string): string {
    const birthCity = cities.find((city) => {
      if (deepEqual(city.coordinates, pointToCoord(birthCoords))) {
        return true;
      }
      return false;
    });
    if (birthCity) return birthCity.id;
    else {
      const id = randomUUID().toString();
      cities.push({
        id,
        coordinates: pointToCoord(birthCoords),
        name: birthplace !== "" ? birthplace : "Unknown",
      });
      return id;
    }
  }

  function checkDeathCity(deathplace: string, deathCoords: string): string {
    const deathCity = cities.find((city) => {
      if (deepEqual(city.coordinates, pointToCoord(deathCoords))) return true;
      return false;
    });

    if (deathCity) return deathCity.id;
    else {
      const id = randomUUID().toString();
      cities.push({
        id,
        coordinates: pointToCoord(deathCoords),
        name: deathplace !== "" ? deathplace : "Unknown",
      });
      return id;
    }
  }

  for (const rawComp of composersRaw) {
    const composer: ComposerDb = {
      id: rawComp.id,
      name: rawComp.name,
      birthdate: rawComp.birthDate
        ? new Date(rawComp.birthDate)
        : new Date("0001-01-01"),
      deathdate: rawComp.deathDate
        ? new Date(rawComp.deathDate)
        : new Date("0001-01-01"),
      birthplace: checkBirthCity(rawComp.birthplace, rawComp.coordsBirth),
      deathplace: checkDeathCity(rawComp.deathplace, rawComp.coordsDeath),
    };

    composers.push(composer);
  }

  return [composers, cities];
};

const processComposersFile = async (path: string): Promise<ComposerRaw[]> => {
  const composers: ComposerRaw[] = [];
  const parse = new Promise<ComposerRaw[]>((resolve, reject) => {
    fs.createReadStream(path, { encoding: "utf8" })
      .pipe(parser())
      .on("data", (record) => {
        if (
          composers.findIndex(
            (comp) =>
              comp.id ==
              record.item.replace("http://www.wikidata.org/entity/", "")
          ) === -1
        ) {
          const comp: ComposerRaw = {
            id: record.item.replace("http://www.wikidata.org/entity/", ""),
            name: record.itemLabel,
            birthDate: record.birthDate,
            birthplace: record.birthplaceLabel,
            coordsBirth: record.coordsBirth,
            coordsDeath: record.coordsDeath,
            deathplace: record.deathplaceLabel,
            deathDate: record.deathDate,
          };

          composers.push(comp);
        }
      })
      .on("error", (error) => {
        reject(error);
      })
      .on("end", () => {
        resolve(composers);
      });
  });

  return parse;
};

const processCitiesFile = async (path: string) => {
  const cities: City[] = [];
  const parse = new Promise<City[]>((resolve, reject) => {
    fs.createReadStream(path, { encoding: "utf8" })
      .pipe(parser())
      .on("data", (record) => {
        if (
          cities.findIndex(
            (city) =>
              city.id ==
              record.item.replace("http://www.wikidata.org/entity/", "")
          ) === -1
        )
          cities.push({
            id: record.item.replace("http://www.wikidata.org/entity/", ""),
            name: record.itemLabel,
            coordinates: pointToCoord(record.coords),
          });
      })
      .on("error", (error) => {
        reject(error);
      })
      .on("end", () => {
        resolve(cities);
      });
  });

  return parse;
};

async function seedCities(cities: City[]) {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS cities (
      id VARCHAR(255) DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      longitude NUMERIC(12, 9) NOT NULL,
      latitude NUMERIC(12,9) NOT NULL
    );
  `;

  console.log("Created table cities.");
  console.log("Insert Cities...");
  console.log(cities.length);

  let counter = 0;

  const query = sql``;

  const insertedCities = await sql`
    INSERT INTO cities
      ${sql(
        cities.map((city) => {
          return {
            id: city.id,
            name: encodeURIComponent(city.name),
            latitude: city.coordinates.latitude,
            longitude: city.coordinates.longitude,
          };
        })
      )}
    ON CONFLICT (id) DO NOTHING;
  `;
  return insertedCities;
}

async function seedComposers(composers: ComposerDb[]) {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS composers (
    id VARCHAR(255) DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    birthplace VARCHAR(255) references cities(id),
    birthDate DATE NOT NULL,
    deathplace VARCHAR(255) references cities(id),
    deathDate DATE NOT NULL
    );
  `;

  console.log("Created table composers.");
  console.log("Insert composers...");
  console.log(composers.length);

  const insertedComposers = await sql`
    INSERT INTO composers 
      ${sql(
        composers.map((c) => {
          return {
            ...c,
            name: encodeURIComponent(c.name),
            birthdate: c.birthdate.toISOString().substring(0, 10),
            deathdate: c.deathdate.toISOString().substring(0, 10),
          };
        })
      )}
    ON CONFLICT (id) DO NOTHING;
  `;

  return insertedComposers;
}

async function seedLocations(composers: ComposerDb[], cities: City[]) {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS locations (
      id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      composer_id VARCHAR(255) references composers(id),
      city_id     VARCHAR(255) references cities(id),
      start_date  DATE NOT NULL,
      end_date    DATE NOT NULL,
      reason      TEXT NOT NULL,
      description TEXT NOT NULL
    );
  `;

  console.log("Created table locations.");
  console.log("Insert locations...");

  const insertedLocationsBirth = await sql`
    INSERT INTO locations
      ${sql(
        composers.map((c) => {
          return {
            composer_id: c.id,
            city_id: c.birthplace,
            start_date: c.birthdate.toISOString().substring(0, 10),
            end_date: c.birthdate.toISOString().substring(0, 10),
            reason: "birth",
            description:
              "Born in " +
              encodeURIComponent(
                cities.find((city) => c.birthplace == city.id)?.name ??
                  "Unknown"
              ),
          };
        })
      )}
    ON CONFLICT (id) DO NOTHING;
  `;
  const insertedLocationsDeath = await sql`
    INSERT INTO locations
      ${sql(
        composers.map((c) => {
          return {
            composer_id: c.id,
            city_id: c.birthplace,
            start_date: c.deathdate.toISOString().substring(0, 10),
            end_date: c.deathdate.toISOString().substring(0, 10),
            reason: "death",
            description:
              "Died in " +
              encodeURIComponent(
                cities.find((city) => c.deathplace == city.id)?.name ??
                  "Unknown"
              ),
          };
        })
      )}
    ON CONFLICT (id) DO NOTHING;
  `;

  return [...insertedLocationsBirth, ...insertedLocationsDeath];
}

const users: User[] = [
  {
    id: randomUUID().toString(),
    name: "davidneuhaus",
    email: "davidneuhaus@web.de",
    password: "Neuhau/13",
  },
  {
    id: randomUUID().toString(),
    name: "beta",
    email: "beta@beta.beta",
    password: "beta",
  },
];

async function seedUsers() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;

  console.log("Created table users.");

  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
        ON CONFLICT (id) DO NOTHING;
      `;
    })
  );

  return insertedUsers;
}

export async function GET() {
  /*
  try {
    const [composers, cities] = await processInputFiles();
    console.log("Try seeding db");
    const userResult = await seedUsers();
    //console.log("User Result: ", userResult);
    console.log("Done seeding users");
    const cityResult = await seedCities(cities);
    //console.log("City Result: ", cityResult);
    console.log("Done seeding cities");
    const composerResult = await seedComposers(composers);
    //console.log("Composer Result: ", composerResult);
    console.log("Done seeding composers");
    const locationResult = await seedLocations(composers, cities);
    console.log("Done seeding locations");
    //console.log("Location Result: ", locationResult);
    return Response.json({ message: "Seed successful" });

  } catch (error) {
    console.error(error);
    return Response.json({ error }, { status: 500 });
  }*/

  return Response.json({
    message:
      "Database is already seeded. Please uncomment code on server to re-seed.",
  });
}
