"use client";

import { addLocation } from "@/app/lib/actions";
import { City } from "@/app/lib/definitions";
import { PlusIcon } from "@heroicons/react/16/solid";
import { useEffect, useState } from "react";
import { ReactSearchAutocomplete } from "react-search-autocomplete";
import { ZodIssue } from "zod";

import styles from "./add-location.module.css";
import Link from "next/link";

export default function AddLocation({
  id,
  cities,
  selectedCity,
}: {
  id: string;
  cities: City[];
  selectedCity?: City;
}) {
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState<ZodIssue[]>([]);
  const [cityId, setCity] = useState<string>("");
  const [isSearching, setIsSearching] = useState(true);
  const [alreadySetInitialCity, setAlreadySetInitialCity] = useState(false);

  function handleClick() {
    setShowForm(!showForm);
  }

  async function submitAction(data: FormData) {
    const response = await addLocation(data);
    if (response instanceof Array) {
      setErrors(response);
    }
  }

  function handleCitySelect(result: City) {
    console.log(result);
    setCity(result.id);
    setIsSearching(false);
  }

  function handleCitySearch(value: string) {
    setIsSearching(true);
  }

  useEffect(() => {
    if (selectedCity && !alreadySetInitialCity) {
      setIsSearching(false);
      setCity(selectedCity.id);
      setShowForm(true);
      setAlreadySetInitialCity(true);
    }
  });

  return (
    <div className="">
      <button
        className={`${
          showForm
            ? "bg-transparent border border-red-800 hover:bg-red-900 hover:border-transparent"
            : "bg-purple-500 hover:bg-purple-700 text-white"
        } font-bold py-2 px-4 rounded mb-4`}
        onClick={handleClick}
      >
        {showForm ? "Cancel" : "Add Location"}
      </button>
      <form action={submitAction} className={`${!showForm && "hidden"} pl-3`}>
        <input type="hidden" name="composer_id" value={id} />
        <div className="grid grid-cols-3 mb-2">
          <label htmlFor="city" className="self-center">
            City
          </label>
          <input type="hidden" name="city_id" value={cityId} />
          <ReactSearchAutocomplete
            items={cities}
            onSelect={handleCitySelect}
            onSearch={handleCitySearch}
            placeholder={
              selectedCity !== undefined
                ? selectedCity.name
                : "Search for a city"
            }
            className={`remove-outline col-span-2 ${
              !isSearching && styles.hiddenSearchIcon
            }`}
            styling={{
              borderRadius: "0",
              fontFamily: "inherit",
            }}
          />
          <Link
            href={`/database/city/add/${id}`}
            className="text-sm text-blue-800 dark:text-blue-600 hover:text-blue-950"
          >
            <div className="flex items-center">
              <PlusIcon className="size-4"></PlusIcon>
              <span>Add city</span>
            </div>
          </Link>
          <span
            className={`${
              errors.findIndex((el) => {
                return el.path[0] === "city_id";
              }) !== -1
                ? "text-red-500 col-start-2 col-span-2"
                : "hidden"
            }`}
          >
            {
              errors.find((el) => {
                return el.path[0] === "city_id";
              })?.message
            }
          </span>
        </div>
        <div className="grid grid-cols-3 mb-2">
          <label htmlFor="start_date" className="self-center">
            From (year)
          </label>
          <input
            type="number"
            min="1000"
            max="2000"
            step="1"
            id="start_date"
            name="start_date"
            className="col-span-2"
          />
          <span
            className={`${
              errors.findIndex((el) => {
                return el.path[0] === "start_date";
              }) !== -1
                ? "text-red-500 col-start-2 col-span-2"
                : "hidden"
            }`}
          >
            {
              errors.find((el) => {
                return el.path[0] === "start_date";
              })?.message
            }
          </span>
        </div>
        <div className="grid grid-cols-3 mb-2">
          <label htmlFor="end_date" className="self-center">
            To (year)
          </label>
          <input
            type="number"
            min="1000"
            max="2099"
            step="1"
            id="end_date"
            name="end_date"
            className="col-span-2"
          />
          <span
            className={`${
              errors.findIndex((el) => {
                return el.path[0] === "end_date";
              }) !== -1
                ? "text-red-500 col-start-2 col-span-2"
                : "hidden"
            }`}
          >
            {
              errors.find((el) => {
                return el.path[0] === "end_date";
              })?.message
            }
          </span>
        </div>
        <div className="grid grid-cols-3 mb-2">
          <label htmlFor="reason" className="self-center">
            Reason
          </label>
          <select id="reason" name="reason" className="col-span-2">
            <option value="">Select a reason</option>
            <option value="journey">Journey</option>
            <option value="residence">Residence</option>
            <option value="job">Job</option>
            <option value="visit">Visit</option>
            <option value="birth">Birth</option>
            <option value="death">Death</option>
            <option value="other">Other</option>
          </select>
          <span
            className={`${
              errors.findIndex((el) => {
                return el.path[0] === "reason";
              }) !== -1
                ? "text-red-500 col-start-2 col-span-2"
                : "hidden"
            }`}
          >
            Please select a reason from the list.
          </span>
        </div>
        <div className="grid grid-cols-3 mb-8">
          <label htmlFor="description" className="pt-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            className="col-span-2 h-24"
          ></textarea>
        </div>
        <div className="grid grid-cols-3 mb-8">
          <button
            type="submit"
            className="bg-purple-500 hover:bg-purple-700 font-bold py-2 px-4 rounded mb-4 text-white col-start-3 justify-self-end"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
