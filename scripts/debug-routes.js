const fs = require("fs");
const src = fs.readFileSync(
  "e:/test/server/src/modules/workers/workers.routes.ts",
  "utf8",
);
const re = new RegExp(
  "router\\.(get|post|patch|delete)\\([\\r\\n\\s]*(['\"][^'\"]+['\"])",
  "g",
);
console.log("=== via new RegExp ===");
const m = [...src.matchAll(re)];
console.log("Total:", m.length);
m.forEach((x, i) => console.log(i + 1, x[1], x[2]));
