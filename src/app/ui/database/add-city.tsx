"use client";

import { useState } from "react";
import SubmitButton from "../utils/submit-button";
import { ZodIssue } from "zod";
import { addCity } from "@/app/lib/actions";
import { useRouter } from "next/navigation";

export default function AddCity({ redirect }: { redirect: string }) {
  const [errors, setErrors] = useState<ZodIssue[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  async function submitAction(data: FormData) {
    const response = await addCity(data);
    if (response instanceof Array) {
      setErrors(response);
    } else {
      setSubmitted(true);
      router.push("/database/composer/" + redirect);
    }
  }

  return (
    <div>
      <form action={submitAction} className="pl-3">
        <div className="grid grid-cols-3 mb-2">
          <label htmlFor="wikidata_id" className="self-center">
            Wikidata ID
          </label>
          <input type="text" name="wikidata_id" className="col-span-2"></input>
          <span
            className={`${
              errors.findIndex((el) => {
                return el.path[0] === "wikidata_id";
              }) !== -1
                ? "text-red-500 col-start-2 col-span-2 mt-1"
                : "hidden"
            }`}
          >
            {
              errors.find((el) => {
                return el.path[0] === "wikidata_id";
              })?.message
            }
          </span>
          <label htmlFor="name" className="col-start-1 self-center">
            City name
          </label>
          <input type="text" name="name" className="col-span-2  mt-2"></input>
          <span
            className={`${
              errors.findIndex((el) => {
                return el.path[0] === "name";
              }) !== -1
                ? "text-red-500 col-start-2 col-span-2 mt-1"
                : "hidden"
            }`}
          >
            {
              errors.find((el) => {
                return el.path[0] === "name";
              })?.message
            }
          </span>
          <label htmlFor="latitude" className="col-start-1 self-center">
            Latitude
          </label>
          <input
            type="text"
            name="latitude"
            className="col-span-2  mt-2"
          ></input>
          <span
            className={`${
              errors.findIndex((el) => {
                return el.path[0] === "latitude";
              }) !== -1
                ? "text-red-500 col-start-2 col-span-2 mt-1"
                : "hidden"
            }`}
          >
            {
              errors.find((el) => {
                return el.path[0] === "latitude";
              })?.message
            }
          </span>
          <label htmlFor="longitude" className="col-start-1 self-center">
            Longitude
          </label>
          <input
            type="text"
            name="longitude"
            className="col-span-2 r mt-2"
          ></input>
          <span
            className={`${
              errors.findIndex((el) => {
                return el.path[0] === "longitude";
              }) !== -1
                ? "text-red-500 col-start-2 col-span-2 mt-1"
                : "hidden"
            }`}
          >
            {
              errors.find((el) => {
                return el.path[0] === "longitude";
              })?.message
            }
          </span>
          <SubmitButton
            text="Add city"
            className="col-start-3 justify-self-end mt-2"
            disabled={submitted}
          />
        </div>
      </form>
    </div>
  );
}
