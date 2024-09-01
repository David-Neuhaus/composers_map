export type Composer = {
  id: string;
  name: string;
  birthDate: Date;
  birthplace: string;
  deathDate: Date;
  deathplace: string;
};

export type City = {
  id: string;
  name: string;
  coordinates: Coord;
};

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type Location = {
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

export type Coord = {
  longitude: number;
  latitude: number;
};
