import fs from "node:fs";
import path from "node:path";

const sourceRoot = path.resolve("template/src");
const spacing = (pixels) => {
  const value = Number(pixels) / 4;
  return Number.isInteger(value) ? String(value) : String(value).replace(/\.0+$/, "");
};

const files = [];
function collect(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) collect(target);
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) files.push(target);
  }
}
collect(sourceRoot);

for (const file of files) {
  const original = fs.readFileSync(file, "utf8");
  let updated = original;

  // Tailwind v4's CSS-variable shorthand: text-[var(--token)] -> text-(--token).
  updated = updated.replace(/([a-z][a-z0-9-]*)-\[var\((--[a-z0-9-]+)\)\]/gi, "$1-($2)");

  // Safe pixel values from Tailwind's spacing scale: max-w-[620px] -> max-w-155.
  updated = updated.replace(/(^|[\s"'`:])(-?)([a-z][a-z0-9-]*)-\[(-?\d+)px\]/g, (_match, prefix, sign, utility, pixels) => {
    const absolutePixels = Math.abs(Number(pixels));
    const value = spacing(absolutePixels);
    const negative = sign === "-" || Number(pixels) < 0;
    return `${prefix}${negative ? "-" : ""}${utility}-${value}`;
  });

  // Safe numeric z-index values: z-[1] -> z-1.
  updated = updated.replace(/(^|[\s"'`])z-\[(\d+)\]/g, "$1z-$2");

  if (updated !== original) fs.writeFileSync(file, updated);
}
