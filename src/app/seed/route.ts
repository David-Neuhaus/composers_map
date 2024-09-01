import bcrypt from "bcrypt";
import format from "pg-format";
import fs from "node:fs";

import { Client } from "pg";
import { parse } from "csv-parse";
import { randomUUID } from "node:crypto";

import { City, Composer, User } from "@/app/lib/definitions";
import { deepEqual, pointToCoord } from "@/app/lib/utils";

const client = new Client();
await client.connect();

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

const processInputFiles = async (): Promise<[Composer[], City[]]> => {
  const cities: City[] = await processCitiesFile(
    "/home/mad/local/composers_map/src/app/seed/Cities_Coords.csv"
  );
  const composers: Composer[] = [];
  const composersRaw: ComposerRaw[] = await processComposersFile(
    "/home/mad/local/composers_map/src/app/seed/Baroque_Composers_EN.csv"
  );

  function checkBirthCity(birthplace: string, birthCoords: string): string {
    const birthCity = cities.find((city) => {
      if (deepEqual(city.coordinates, pointToCoord(birthCoords))) return true;
      return false;
    });

    if (birthCity) return birthCity.id;
    else {
      const id = randomUUID().toString();
      cities.push({
        id,
        coordinates: pointToCoord(birthCoords),
        name: birthplace ?? "Unknown",
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
        name: deathplace ?? "Unknown",
      });
      return id;
    }
  }

  for (const rawComp of composersRaw) {
    const composer: Composer = {
      id: rawComp.id,
      name: rawComp.name,
      birthDate: rawComp.birthDate
        ? new Date(rawComp.birthDate)
        : new Date("0001-01-01"),
      deathDate: rawComp.deathDate
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
  const parser = fs.createReadStream(path, "utf-8").pipe(
    parse({
      columns: true,
    })
  );
  for await (const record of parser) {
    const comp: ComposerRaw = {
      id: record.item,
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
  return composers;
};

const processCitiesFile = async (path: string) => {
  const cities: City[] = [];
  const parser = fs.createReadStream(path, "utf-8").pipe(
    parse({
      columns: true,
    })
  );
  for await (const record of parser) {
    cities.push({
      id: record.item,
      name: record.itemLabel,
      coordinates: pointToCoord(record.coords),
    });
  }
  return cities;
};

async function seedCities(cities: City[]) {
  await client.query(format(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`));
  await client.query(`
    CREATE TABLE IF NOT EXISTS cities (
      id VARCHAR(255) DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      longitude NUMERIC(12, 9) NOT NULL,
      latitude NUMERIC(12,9) NOT NULL
    );
  `);

  console.log("Created table cities.");
  console.log("Insert Cities...");
  console.log(cities.length);

  let counter = 0;

  const insertedCities = await Promise.all(
    cities.map(async (city) => {
      counter++;
      return client.query(
        format(
          `
        INSERT INTO cities (id, name, longitude, latitude)
        VALUES (%L, %L, %L, %L)
        ON CONFLICT (id) DO NOTHING;
      `,
          city.id,
          city.name,
          city.coordinates.longitude,
          city.coordinates.latitude
        )
      );
    })
  );

  console.log("Inserted cities: ", counter);

  return insertedCities;
}

async function seedComposers(composers: Composer[]) {
  await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  await client.query(
    format(
      `CREATE TABLE IF NOT EXISTS composers (
      id VARCHAR(255) DEFAULT uuid_generate_v4() PRIMARY KEY,
      name TEXT NOT NULL,
      birthplace VARCHAR(255) references cities(id),
      birthDate DATE NOT NULL,
      deathplace VARCHAR(255) references cities(id),
      deathDate DATE NOT NULL
    );
  `
    )
  );

  console.log("Created table composers.");
  console.log("Insert composers...");
  console.log(composers.length);

  const insertedComposers = await Promise.all(
    composers.map(async (composer) => {
      //console.log(composer);
      return client.query(
        format(
          `
        INSERT INTO composers (id, name, birthplace, birthDate, deathplace, deathDate)
        VALUES (%L, %L, %L, %L, %L, %L)
        ON CONFLICT (id) DO NOTHING;
      `,
          composer.id,
          composer.name,
          composer.birthplace,
          composer.birthDate.toISOString().substring(0, 10),
          composer.deathplace,
          composer.deathDate.toISOString().substring(0, 10)
        )
      );
    })
  );

  return insertedComposers;
}

async function seedLocations(composers: Composer[]) {
  await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  await client.query(`
    CREATE TABLE IF NOT EXISTS locations (
      id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      composer_id VARCHAR(255) references composers(id),
      city_id     VARCHAR(255) references cities(id),
      start_date  DATE NOT NULL,
      end_date    DATE NOT NULL,
      reason      TEXT NOT NULL,
      description TEXT NOT NULL
    );
  `);

  console.log("Created table locations.");
  console.log("Insert locations...");

  const insertedLocations = await Promise.all(
    composers.map(async (comp) => {
      return Promise.all([
        client.query(
          format(
            `
        INSERT INTO locations (composer_id, city_id, start_date, end_date, reason, description)
        VALUES (%L, %L, %L, %L, %L, %L)
        ON CONFLICT (id) DO NOTHING;
      `,
            comp.id,
            comp.birthplace,
            comp.birthDate.toISOString().substring(0, 10),
            comp.birthDate.toISOString().substring(0, 10),
            "birth",
            "Born in " + comp.birthplace
          )
        ),
        client.query(
          format(
            `
        INSERT INTO locations (composer_id, city_id, start_date, end_date, reason, description)
        VALUES (%L, %L, %L, %L, %L, %L)
        ON CONFLICT (id) DO NOTHING;
      `,
            comp.id,
            comp.deathplace,
            comp.deathDate.toISOString().substring(0, 10),
            comp.deathDate.toISOString().substring(0, 10),
            "death",
            "Died in " + comp.deathplace
          )
        ),
      ]);
    })
  );

  return insertedLocations.flat(1);
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
  await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `);

  console.log("Created table users.");

  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return client.query(
        format(
          `
        INSERT INTO users (id, name, email, password)
        VALUES (%L, %L, %L, %L)
        ON CONFLICT (id) DO NOTHING;
      `,
          user.id,
          user.name,
          user.email,
          hashedPassword
        )
      );
    })
  );

  return insertedUsers;
}

export async function GET() {
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
    const locationResult = await seedLocations(composers);
    console.log("Done seeding locations");
    //console.log("Location Result: ", locationResult);
    return Response.json({ message: "Seed successful" });
  } catch (error) {
    console.error(error);
    return Response.json({ error }, { status: 500 });
  }
}
