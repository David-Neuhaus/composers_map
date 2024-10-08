"use server";

import { redirect } from "next/navigation";
import { sql } from "./data";
import { CityDb, LocationDb, LocationInput } from "./definitions";

import { z, ZodIssue } from "zod";

const locationFormSchema = z
  .object({
    composer_id: z.string(),
    city_id: z.string(),
    start_date: z.coerce.number().int().min(1000).max(2099),
    end_date: z.coerce.number().int().min(1000).max(2099),
    reason: z.enum([
      "journey",
      "residence",
      "job",
      "visit",
      "birth",
      "death",
      "other",
    ]),
    description: z.string(),
  })
  .refine((data) => data.city_id !== "", {
    message: "Please select a city",
    path: ["city_id"],
  })
  .refine((data) => data.start_date <= data.end_date, {
    message: "End date must be after start date",
    path: ["end_date"],
  });

export async function addLocation(
  locationData: FormData
): Promise<LocationDb | ZodIssue[] | null> {
  const validatedData = locationFormSchema.safeParse({
    composer_id: locationData.get("composer_id"),
    city_id: locationData.get("city_id"),
    start_date: locationData.get("start_date"),
    end_date: locationData.get("end_date"),
    reason: locationData.get("reason"),
    description: locationData.get("description"),
  });

  if (!validatedData.success) {
    console.error(validatedData.error);
    console.error(locationData);
    return validatedData.error.errors;
  }

  const { composer_id, city_id, start_date, end_date, reason, description } =
    validatedData.data;

  const location: LocationInput = {
    composer_id,
    city_id,
    start_date: "01-01-" + start_date,
    end_date: "01-01-" + end_date,
    reason,
    description,
  };

  try {
    const data = await sql<LocationDb[]>`
    INSERT INTO locations ${sql(location)} RETURNING *;
  `;
    return data[0];
  } catch (error) {
    console.error(error);
    return null;
  }
}

const cityFormSchema = z
  .object({
    wikidata_id: z.string().optional(),
    name: z.string(),
    longitude: z.coerce.number().min(-180).max(180),
    latitude: z.coerce.number().min(-90).max(90),
  })
  .refine((data) => data.name !== "", {
    message: "Please enter a city name",
    path: ["name"],
  })
  .refine((data) => data.latitude !== 0, {
    message: "Please enter a latitude",
    path: ["latitude"],
  })
  .refine((data) => data.longitude !== 0, {
    message: "Please enter a longitude",
    path: ["longitude"],
  });

export async function addCity(
  cityData: FormData
): Promise<CityDb | ZodIssue[] | null> {
  const validatedData = cityFormSchema.safeParse({
    wikidata_id: cityData.get("wikidata_id"),
    name: cityData.get("name"),
    latitude: cityData.get("latitude"),
    longitude: cityData.get("longitude"),
  });

  if (!validatedData.success) {
    console.error(validatedData.error);
    console.error(cityData);
    return validatedData.error.errors;
  }

  const { wikidata_id, name, longitude, latitude } = validatedData.data;

  if (wikidata_id === "" || wikidata_id === undefined) {
    try {
      const data = await sql<CityDb[]>`
        INSERT INTO cities (name, latitude, longitude)
        VALUES (${name}, ${latitude}, ${longitude});
        `;
      return data[0];
    } catch (error) {
      console.error(error);
      return null;
    }
  } else {
    try {
      const data = await sql<CityDb[]>`
        INSERT INTO cities (id, name, latitude, longitude)
        VALUES (${wikidata_id}, ${name}, ${latitude}, ${longitude});
        `;
      return data[0];
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
