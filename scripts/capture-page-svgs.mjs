/**
 * Thin alias — canonical tooling lives under
 * `All current frontend designs/svg generation/`.
 */
import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const target = path.resolve(
  here,
  "../All current frontend designs/svg generation/capture-page-svgs.mjs",
);
await import(pathToFileURL(target).href);
