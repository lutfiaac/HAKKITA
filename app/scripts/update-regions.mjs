import { mkdir, writeFile } from "node:fs/promises";

const source = "https://wilayah.id/api";
async function read(path) {
  const response = await fetch(`${source}/${path}.json`);
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return response.json();
}
const { data: provinces, meta } = await read("provinces");
const results = await Promise.allSettled(
  provinces.map(async (province) => {
    const { data: cities } = await read(`regencies/${province.code}`);
    return {
      ...province,
      // Keep the existing application profile/URL vocabulary.
      name:
        province.name === "Daerah Istimewa Yogyakarta"
          ? "DI Yogyakarta"
          : province.name,
      cities,
    };
  }),
);
const errors = results.filter((result) => result.status === "rejected");
if (errors.length)
  throw new AggregateError(errors.map((result) => result.reason));
const regions = results.map((result) => result.value);
const cities = regions.flatMap((province) => province.cities);
if (
  regions.length !== 38 ||
  cities.length !== 514 ||
  new Set(cities.map((city) => city.code)).size !== 514
) {
  throw new Error(
    "Unexpected province/district coverage; review source before replacing dataset.",
  );
}
const directory = new URL("../src/data/", import.meta.url);
await mkdir(directory, { recursive: true });
await writeFile(
  new URL("indonesia-regions.json", directory),
  JSON.stringify(
    {
      source: "https://wilayah.id/",
      sourceUpdatedAt: meta.updated_at,
      retrievedAt: new Date().toISOString().slice(0, 10),
      regions,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Saved ${regions.length} provinces and ${cities.length} regencies/cities.`,
);
