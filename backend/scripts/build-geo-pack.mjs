#!/usr/bin/env node
/**
 * Build UN countries + major-cities seed pack.
 *
 * Inputs (download once, or pass paths):
 *   - Geonames countryInfo.txt
 *   - Geonames cities15000.txt
 *
 * Outputs:
 *   - backend/prisma/data/un_countries.json
 *   - backend/prisma/data/major_cities.json
 *
 * Rules: capital always included; top cities by population; max 8 per country; min 1.
 *
 * Usage:
 *   node scripts/build-geo-pack.mjs [/path/to/countryInfo.txt] [/path/to/cities15000.txt]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "../prisma/data");
const MAX_CITIES = 8;

/** UN member states ISO 3166-1 alpha-3 (193 + common testing extras ≈ 196). */
const UN_ISO3 = new Set([
  "AFG","ALB","DZA","AND","AGO","ATG","ARG","ARM","AUS","AUT","AZE","BHS","BHR","BGD","BRB","BLR",
  "BEL","BLZ","BEN","BTN","BOL","BIH","BWA","BRA","BRN","BGR","BFA","BDI","CPV","KHM","CMR","CAN",
  "CAF","TCD","CHL","CHN","COL","COM","COG","COD","CRI","CIV","HRV","CUB","CYP","CZE","DNK","DJI",
  "DMA","DOM","ECU","EGY","SLV","GNQ","ERI","EST","SWZ","ETH","FJI","FIN","FRA","GAB","GMB","GEO",
  "DEU","GHA","GRC","GRD","GTM","GIN","GNB","GUY","HTI","HND","HUN","ISL","IND","IDN","IRN","IRQ",
  "IRL","ISR","ITA","JAM","JPN","JOR","KAZ","KEN","KIR","PRK","KOR","KWT","KGZ","LAO","LVA","LBN",
  "LSO","LBR","LBY","LIE","LTU","LUX","MDG","MWI","MYS","MDV","MLI","MLT","MHL","MRT","MUS","MEX",
  "FSM","MDA","MCO","MNG","MNE","MAR","MOZ","MMR","NAM","NRU","NPL","NLD","NZL","NIC","NER","NGA",
  "MKD","NOR","OMN","PAK","PLW","PAN","PNG","PRY","PER","PHL","POL","PRT","QAT","ROU","RUS","RWA",
  "KNA","LCA","VCT","WSM","SMR","STP","SAU","SEN","SRB","SYC","SLE","SGP","SVK","SVN","SLB","SOM",
  "ZAF","SSD","ESP","LKA","SDN","SUR","SWE","CHE","SYR","TJK","TZA","THA","TLS","TGO","TON","TTO",
  "TUN","TUR","TKM","TUV","UGA","UKR","ARE","GBR","USA","URY","UZB","VUT","VEN","VNM","YEM","ZMB",
  "ZWE","PSE","VAT","TWN", // extras for ~196 testing coverage
]);

function slugify(name) {
  return String(name)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_")
    .slice(0, 48);
}

function shortCitySlug(name) {
  const s = slugify(name);
  // Prefer readable short forms for multi-word cities
  const parts = s.split("_").filter(Boolean);
  if (parts.length >= 3 && parts[0] === "sao") return parts.slice(0, 2).join("_"); // sao_paulo
  if (parts.length > 3) return parts.slice(0, 3).join("_");
  return s;
}

function loadCountries(file) {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  /** @type {Map<string, {iso2:string,iso3:string,name:string,capital:string,slug:string}>} */
  const byIso3 = new Map();
  for (const line of lines) {
    if (!line || line.startsWith("#")) continue;
    const cols = line.split("\t");
    const iso2 = cols[0];
    const iso3 = cols[1];
    const name = cols[4];
    const capital = cols[5] || "";
    if (!iso3 || !UN_ISO3.has(iso3)) continue;
    byIso3.set(iso3, {
      iso2,
      iso3,
      name,
      capital,
      slug: slugify(name === "Korea, Democratic People's Republic of" || name.includes("Korea") && iso3 === "PRK"
        ? "North Korea"
        : name === "Korea, Republic of" || (name.includes("Korea") && iso3 === "KOR")
          ? "South Korea"
          : name === "United States"
            ? "United States"
            : name === "United Kingdom"
              ? "United Kingdom"
              : name === "Russian Federation"
                ? "Russia"
                : name === "Iran, Islamic Republic of"
                  ? "Iran"
                  : name === "Syrian Arab Republic"
                    ? "Syria"
                    : name === "Viet Nam"
                      ? "Vietnam"
                      : name === "Lao People's Democratic Republic"
                        ? "Laos"
                        : name === "Republic of Moldova"
                          ? "Moldova"
                          : name === "United Republic of Tanzania"
                            ? "Tanzania"
                            : name === "Bolivia, Plurinational State of"
                              ? "Bolivia"
                              : name === "Venezuela, Bolivarian Republic of"
                                ? "Venezuela"
                                : name === "Micronesia, Federated States of"
                                  ? "Micronesia"
                                  : name === "Congo, Democratic Republic of the"
                                    ? "DR Congo"
                                    : name === "Congo"
                                      ? "Congo"
                                      : name === "Czechia"
                                        ? "Czech Republic"
                                        : name === "Türkiye" || name === "Turkey"
                                          ? "Turkey"
                                          : name === "Palestine, State of"
                                            ? "Palestine"
                                            : name === "Holy See (Vatican City State)"
                                              ? "Vatican"
                                              : name === "Taiwan"
                                                ? "Taiwan"
                                                : name),
    });
  }
  // Fix display names / slugs for awkward Geonames labels
  for (const c of byIso3.values()) {
    const pretty = {
      PRK: "North Korea",
      KOR: "South Korea",
      USA: "United States",
      GBR: "United Kingdom",
      RUS: "Russia",
      IRN: "Iran",
      SYR: "Syria",
      VNM: "Vietnam",
      LAO: "Laos",
      MDA: "Moldova",
      TZA: "Tanzania",
      BOL: "Bolivia",
      VEN: "Venezuela",
      FSM: "Micronesia",
      COD: "DR Congo",
      COG: "Congo",
      CZE: "Czech Republic",
      TUR: "Turkey",
      PSE: "Palestine",
      VAT: "Vatican",
      TWN: "Taiwan",
      MKD: "North Macedonia",
      SWZ: "Eswatini",
      TLS: "Timor-Leste",
      CIV: "Ivory Coast",
      MMR: "Myanmar",
      BRN: "Brunei",
      ARE: "United Arab Emirates",
    };
    if (pretty[c.iso3]) {
      c.name = pretty[c.iso3];
      c.slug = slugify(pretty[c.iso3]);
    } else {
      c.slug = slugify(c.name);
    }
  }
  return byIso3;
}

function loadCities(file) {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  /** @type {Array<{name:string,ascii:string,iso2:string,pop:number,lat:number,lng:number}>} */
  const cities = [];
  for (const line of lines) {
    if (!line) continue;
    const cols = line.split("\t");
    const name = cols[1];
    const ascii = cols[2] || name;
    const lat = Number(cols[4]);
    const lng = Number(cols[5]);
    const iso2 = cols[8];
    const pop = Number(cols[14]) || 0;
    if (!iso2 || !name) continue;
    cities.push({ name, ascii, iso2, pop, lat, lng });
  }
  return cities;
}

function pickCitiesForCountry(country, allCities) {
  const inCountry = allCities
    .filter((c) => c.iso2 === country.iso2)
    .sort((a, b) => b.pop - a.pop);

  const selected = [];
  const seen = new Set();

  function add(city) {
    if (!city) return;
    const slug = shortCitySlug(city.ascii || city.name);
    if (!slug || seen.has(slug)) return;
    seen.add(slug);
    selected.push({
      name: city.name,
      slug,
      population: city.pop,
      lat: city.lat,
      lng: city.lng,
      isCapital: false,
    });
  }

  // Capital first (match by name loosely)
  const capName = (country.capital || "").toLowerCase();
  if (capName) {
    const cap =
      inCountry.find((c) => c.name.toLowerCase() === capName) ||
      inCountry.find((c) => c.ascii.toLowerCase() === capName) ||
      inCountry.find((c) => c.name.toLowerCase().includes(capName) || capName.includes(c.name.toLowerCase()));
    if (cap) {
      add(cap);
      selected[0].isCapital = true;
    }
  }

  for (const city of inCountry) {
    if (selected.length >= MAX_CITIES) break;
    add(city);
  }

  // Ensure at least one city: use capital string as synthetic if no geonames hit
  if (selected.length === 0) {
    const fallback = country.capital || country.name;
    selected.push({
      name: fallback,
      slug: shortCitySlug(fallback),
      population: 0,
      lat: 0,
      lng: 0,
      isCapital: true,
    });
  }

  return selected;
}

function main() {
  const countryFile = process.argv[2] || "/tmp/countryInfo.txt";
  const citiesFile = process.argv[3] || "/tmp/geonames/cities15000.txt";

  if (!fs.existsSync(countryFile) || !fs.existsSync(citiesFile)) {
    console.error("Missing Geonames inputs. Download:");
    console.error("  curl -sL -o /tmp/countryInfo.txt https://download.geonames.org/export/dump/countryInfo.txt");
    console.error("  curl -sL -o /tmp/cities15000.zip https://download.geonames.org/export/dump/cities15000.zip && unzip -o /tmp/cities15000.zip -d /tmp/geonames");
    process.exit(1);
  }

  const countriesMap = loadCountries(countryFile);
  const allCities = loadCities(citiesFile);

  const countries = [...countriesMap.values()].sort((a, b) => a.name.localeCompare(b.name));
  const majorCities = [];

  for (const c of countries) {
    const cities = pickCitiesForCountry(c, allCities);
    for (const city of cities) {
      majorCities.push({
        countryCode: c.iso3,
        countrySlug: c.slug,
        countryName: c.name,
        cityName: city.name,
        citySlug: city.slug,
        population: city.population,
        isCapital: city.isCapital,
        lat: city.lat,
        lng: city.lng,
      });
    }
  }

  fs.mkdirSync(dataDir, { recursive: true });
  const countriesOut = countries.map((c) => ({
    countryCode: c.iso3,
    iso2: c.iso2,
    name: c.name,
    slug: c.slug,
    capital: c.capital,
  }));

  fs.writeFileSync(path.join(dataDir, "un_countries.json"), JSON.stringify(countriesOut, null, 2) + "\n");
  fs.writeFileSync(path.join(dataDir, "major_cities.json"), JSON.stringify(majorCities, null, 2) + "\n");

  const byCountry = new Map();
  for (const m of majorCities) {
    byCountry.set(m.countryCode, (byCountry.get(m.countryCode) || 0) + 1);
  }
  const bd = majorCities.filter((m) => m.countryCode === "BGD");
  console.log(`Countries: ${countriesOut.length}`);
  console.log(`Cities: ${majorCities.length}`);
  console.log(`Min cities/country: ${Math.min(...byCountry.values())}`);
  console.log(`Max cities/country: ${Math.max(...byCountry.values())}`);
  console.log(`Bangladesh cities (${bd.length}): ${bd.map((c) => c.citySlug).join(", ")}`);
  console.log(`Wrote ${path.join(dataDir, "un_countries.json")}`);
  console.log(`Wrote ${path.join(dataDir, "major_cities.json")}`);
}

main();
