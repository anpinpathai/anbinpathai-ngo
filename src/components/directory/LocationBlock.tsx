"use client";

import { useState } from "react";
import { GridSelect } from "@/components/admin/GridSelect";
import {
  RESIDENCE_ABROAD,
  RESIDENCE_LK,
  SRI_LANKA_TA,
  type DirectoryFieldRow,
  type EntryValues,
} from "@/lib/directory/config";
import { COUNTRIES, OTHER_COUNTRY, SRI_LANKA_DISTRICTS, dsDivisionsOf } from "@/lib/directory/places";
import type { FormUi } from "@/lib/directory/ui-text";
import { FieldShell, inputClass, type FormMode } from "./FieldShell";

// The words of the admin's place lists (the admin panel is always in English).
const PICK = { search: "Find a place", none: "Nothing matches." };

// "Where do you live?" Sri Lanka (district, then division, then village and postal code) or another country.
// Only the questions the admin switched on for the form appear. In the admin panel the long lists (districts, divisions,
// countries) open as a neat grid panel; visitors and reviewers keep the plain drop-down lists of their own phone or computer.
export function LocationBlock({
  fields,
  values,
  shares,
  errors,
  ui,
  mode,
}: {
  fields: Map<string, DirectoryFieldRow>;
  values: EntryValues;
  shares: Record<string, boolean>;
  errors: Record<string, string>;
  ui: FormUi;
  mode: FormMode;
}) {
  const text = (key: string) => (typeof values[key] === "string" ? (values[key] as string) : "");

  const [residence, setResidence] = useState(text("residence") === RESIDENCE_ABROAD ? RESIDENCE_ABROAD : RESIDENCE_LK);
  const [district, setDistrict] = useState(text("district"));
  const [ds, setDs] = useState(text("ds_division"));

  const startCountry = text("country");
  const known = (COUNTRIES as readonly string[]).includes(startCountry) && startCountry !== OTHER_COUNTRY;
  const typedCountry = startCountry !== "" && startCountry !== SRI_LANKA_TA && !known;
  const [countryChoice, setCountryChoice] = useState(known ? startCountry : typedCountry ? OTHER_COUNTRY : "");
  const [countryText, setCountryText] = useState(typedCountry ? startCountry : "");

  const abroad = residence === RESIDENCE_ABROAD;
  const countryValue = abroad ? (countryChoice === OTHER_COUNTRY ? countryText : countryChoice) : SRI_LANKA_TA;
  const dsList = dsDivisionsOf(district);

  const residenceField = fields.get("residence");

  // The questions on the screen now. Two sit side by side; with an odd number, the last one takes the whole row.
  const onScreen = (abroad ? ["country", "native_district", "city"] : ["district", "ds_division", "gn_division", "postal_code", "city"]).filter((k) =>
    fields.has(k),
  );
  const lone = onScreen.length % 2 === 1 ? onScreen[onScreen.length - 1] : null;

  const shell = (key: string, children: React.ReactNode, id = `f-${key}`) => {
    const field = fields.get(key);
    if (!field) return null;
    return (
      <FieldShell key={key} field={field} id={id} error={errors[key]} ui={ui} mode={mode} shared={shares[key] === true} full={key === lone}>
        {children}
      </FieldShell>
    );
  };

  const admin = mode === "admin";

  const select = (name: string, value: string, onChange: (v: string) => void, options: readonly string[], error?: string) =>
    admin ? (
      <GridSelect
        id={`f-${name}`}
        name={name}
        value={value}
        onChange={onChange}
        options={options}
        labelId={`f-${name}-label`}
        anyLabel={ui.choose}
        searchLabel={PICK.search}
        noMatch={PICK.none}
        className={`${inputClass(error)} select-arrow`}
      />
    ) : (
      <select
        id={`f-${name}`}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        className={inputClass(error)}
      >
        <option value="">{ui.choose}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );

  const textBox = (name: string, value: string, onChange: (v: string) => void, placeholder?: string, error?: string) => (
    <input
      id={`f-${name}`}
      name={name}
      type="text"
      value={value}
      placeholder={placeholder}
      maxLength={80}
      onChange={(e) => onChange(e.target.value)}
      aria-invalid={Boolean(error)}
      className={inputClass(error)}
    />
  );

  return (
    <div className="sm:col-span-2">
      {residenceField && (
        <FieldShell field={residenceField} id="f-residence" error={errors.residence} ui={ui} mode={mode} shared>
          <div role="radiogroup" aria-labelledby="f-residence-label" className="mt-2 grid gap-3 sm:grid-cols-2">
            {[
              { value: RESIDENCE_LK, label: ui.residenceLk },
              { value: RESIDENCE_ABROAD, label: ui.residenceAbroad },
            ].map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-line bg-white px-4 py-3 font-semibold text-ink transition-colors has-[:checked]:border-brand has-[:checked]:bg-brand/5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand/40"
              >
                <input
                  type="radio"
                  name="residence"
                  value={option.value}
                  checked={residence === option.value}
                  onChange={() => setResidence(option.value)}
                  className="h-4 w-4 accent-brand"
                />
                {option.label}
              </label>
            ))}
          </div>
        </FieldShell>
      )}

      <div className="grid gap-x-5 sm:grid-cols-2">
        {!abroad && (
          <>
            {shell("district", select("district", district, (v) => { setDistrict(v); setDs(""); }, SRI_LANKA_DISTRICTS, errors.district))}
            {shell(
              "ds_division",
              dsList
                ? select("ds_division", ds, setDs, dsList, errors.ds_division)
                : textBox("ds_division", ds, setDs, ui.typeDs, errors.ds_division),
            )}
            {shell(
              "gn_division",
              <input
                id="f-gn_division"
                name="gn_division"
                type="text"
                maxLength={80}
                defaultValue={text("gn_division")}
                aria-invalid={Boolean(errors.gn_division)}
                className={inputClass(errors.gn_division)}
              />,
            )}
            {shell(
              "postal_code",
              <input
                id="f-postal_code"
                name="postal_code"
                type="text"
                inputMode="numeric"
                maxLength={5}
                defaultValue={text("postal_code")}
                aria-invalid={Boolean(errors.postal_code)}
                className={inputClass(errors.postal_code)}
              />,
            )}
          </>
        )}

        {abroad && (
          <>
            {shell(
              "country",
              <>
                <input type="hidden" name="country" value={countryValue} />
                {admin ? (
                  <GridSelect
                    id="f-country"
                    value={countryChoice}
                    onChange={setCountryChoice}
                    options={COUNTRIES}
                    labelId="f-country-label"
                    anyLabel={ui.choose}
                    searchLabel={PICK.search}
                    noMatch={PICK.none}
                    className={`${inputClass(errors.country)} select-arrow`}
                  />
                ) : (
                  <select
                    id="f-country"
                    value={countryChoice}
                    onChange={(e) => setCountryChoice(e.target.value)}
                    aria-invalid={Boolean(errors.country)}
                    className={inputClass(errors.country)}
                  >
                    <option value="">{ui.choose}</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                )}
                {countryChoice === OTHER_COUNTRY && (
                  <input
                    type="text"
                    value={countryText}
                    maxLength={60}
                    placeholder={ui.typeCountry}
                    onChange={(e) => setCountryText(e.target.value)}
                    aria-label={ui.typeCountry}
                    className={inputClass(errors.country)}
                  />
                )}
              </>,
            )}
            {shell(
              "native_district",
              admin ? (
                <GridSelect
                  id="f-native_district"
                  name="native_district"
                  value={text("native_district")}
                  options={SRI_LANKA_DISTRICTS}
                  labelId="f-native_district-label"
                  anyLabel={ui.choose}
                  searchLabel={PICK.search}
                  noMatch={PICK.none}
                  className={`${inputClass(errors.native_district)} select-arrow`}
                />
              ) : (
                <select
                  id="f-native_district"
                  name="native_district"
                  defaultValue={text("native_district")}
                  aria-invalid={Boolean(errors.native_district)}
                  className={inputClass(errors.native_district)}
                >
                  <option value="">{ui.choose}</option>
                  {SRI_LANKA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              ),
            )}
          </>
        )}

        {shell(
          "city",
          <input
            id="f-city"
            name="city"
            type="text"
            maxLength={80}
            defaultValue={text("city")}
            aria-invalid={Boolean(errors.city)}
            className={inputClass(errors.city)}
          />,
        )}
      </div>
    </div>
  );
}
