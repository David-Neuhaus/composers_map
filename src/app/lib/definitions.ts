export type ComposerDb = {
  id: string;
  name: string;
  birthdate: Date;
  birthplace: string;
  deathdate: Date;
  deathplace: string;
};

export type ComposerWithCitiesDb = {
  id: string;
  name: string;
  birthdate: Date;
  birthplace_id: string;
  birthplace_name: string;
  birthplace_latitude: number;
  birthplace_longitude: number;
  deathdate: Date;
  deathplace_id: string;
  deathplace_name: string;
  deathplace_latitude: number;
  deathplace_longitude: number;
};

export type Composer = {
  id: string;
  name: string;
  birthDate: Date;
  birthplace: City;
  deathDate: Date;
  deathplace: City;
  locations: Location[];
};

export type ComposerTable = Composer[];

export type City = {
  id: string;
  name: string;
  coordinates: Coord;
};

export type CityDb = {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
};

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type LocationDb = {
  id: string;
  composer_id: string;
  city_id: string;
  start_date: Date;
  end_date: Date;
  reason:
    | "journey"
    | "residence"
    | "job"
    | "visit"
    | "birth"
    | "death"
    | "other";
  description: string;
};

export type LocationWithCityDb = {
  id: string;
  composer_id: string;
  city_id: string;
  city_name: string;
  city_latitude: number;
  city_longitude: number;
  start_date: Date;
  end_date: Date;
  reason:
    | "journey"
    | "residence"
    | "job"
    | "visit"
    | "birth"
    | "death"
    | "other";
  description: string;
};

export type Location = {
  id: string;
  composer_id: string;
  city: City;
  start_date: Date;
  end_date: Date;
  reason:
    | "journey"
    | "residence"
    | "job"
    | "visit"
    | "birth"
    | "death"
    | "other";
  description: string;
};

export type Coord = {
  longitude: number;
  latitude: number;
};
