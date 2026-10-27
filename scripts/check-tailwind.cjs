const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const postcss = require("postcss");
const tailwind = require("@tailwindcss/postcss");

async function check() {
  const from = path.resolve(__dirname, "../src/styles/layout-utilities.css");
  const result = await postcss([tailwind()]).process(
    fs.readFileSync(from, "utf8"),
    { from }
  );
  const selectors = new Set();
  result.root.walkRules((rule) => selectors.add(rule.selector));
  const classes = new Set();
  function visit(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const filename = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(filename);
      else if (filename.endsWith(".tsx")) {
        const source = fs.readFileSync(filename, "utf8");
        for (const match of source.matchAll(/ml:[^"\s`{}]+/g)) {
          classes.add(match[0]);
        }
      }
    }
  }
  visit(path.resolve(__dirname, "../src/components"));
  visit(path.resolve(__dirname, "../src/styles"));
  assert(classes.size > 0, "Expected prefixed layout utilities");
  for (const value of classes) {
    const selector = "." + value.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
    assert(
      [...selectors].some(
        (candidate) =>
          candidate === selector ||
          candidate.startsWith(selector + " ") ||
          candidate.startsWith(selector + ":")
      ),
      `Missing compiled utility: ${value}`
    );
  }
  assert.match(result.css, /--ml-color-blue-500:\s*#3b82f6/);
  assert.match(result.css, /--ml-color-blue-900:\s*#1e3a8a/);
  assert.match(result.css, /width >= 48rem/);
  assert.match(result.css, /width >= 64rem/);
  assert.match(result.css, /border-style:\s*solid/);
  assert(!result.css.includes("box-sizing"), "Preflight must not be bundled");
  assert(
    !result.css.includes("@layer utilities"),
    "Utilities must be unlayered"
  );
  assert(
    fs
      .readFileSync(
        path.resolve(__dirname, "../src/root.component.tsx"),
        "utf8"
      )
      .includes('import "./styles/layout-utilities.css"'),
    "The layout must import its utility CSS"
  );
  console.log(
    `Verified ${classes.size} compiled layout utilities without adding a new reset.`
  );
}

check().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
