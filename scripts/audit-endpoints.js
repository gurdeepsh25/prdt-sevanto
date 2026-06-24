const fs = require("fs");

function parseRouteFile(path) {
  const src = fs.readFileSync(path, "utf8");
  // Collapse `router.METHOD(\n  "path",` into single line.
  const re = /router\.(get|post|patch|delete)\(\s*['"]([^'"]+)['"]/g;
  const endpoints = [];
  let m;
  while ((m = re.exec(src)) !== null) {
    endpoints.push({ method: m[1].toUpperCase(), path: m[2] });
  }
  return endpoints;
}

const auth = parseRouteFile(
  "e:/test/server/src/modules/auth/auth.routes.ts",
).map((e) => ({ ...e, full: `/api/v1/auth${e.path === "/" ? "" : e.path}` }));
const users = parseRouteFile(
  "e:/test/server/src/modules/users/users.routes.ts",
).map((e) => ({ ...e, full: `/api/v1/users${e.path === "/" ? "" : e.path}` }));

console.log("=== Auth endpoints ===");
auth.forEach((e) => console.log(`  ${e.method.padEnd(6)} ${e.full}`));
console.log(`  Total: ${auth.length}\n`);

console.log("=== User endpoints ===");
users.forEach((e) => console.log(`  ${e.method.padEnd(6)} ${e.full}`));
console.log(`  Total: ${users.length}\n`);

const all = auth.concat(users);

console.log("=== Phase 1 spec endpoints ===");
const p1 = [
  ["POST", "/api/v1/auth/signup"],
  ["POST", "/api/v1/auth/login"],
  ["POST", "/api/v1/auth/refresh"],
  ["POST", "/api/v1/auth/logout"],
  ["GET", "/api/v1/auth/verify-email"],
  ["POST", "/api/v1/auth/resend-verification"],
  ["POST", "/api/v1/auth/forgot-password"],
  ["POST", "/api/v1/auth/reset-password"],
];
let p1miss = 0;
p1.forEach(([m, p]) => {
  const found = all.find((e) => e.method === m && e.full === p);
  if (!found) p1miss++;
  console.log(`  ${m.padEnd(6)} ${p.padEnd(40)} ${found ? "OK" : "MISSING"}`);
});

console.log("\n=== Phase 2 spec endpoints ===");
const p2 = [
  ["GET", "/api/v1/users/me"],
  ["PATCH", "/api/v1/users/me"],
  ["POST", "/api/v1/users/me/password"],
  ["POST", "/api/v1/users/me/delete"],
  ["POST", "/api/v1/users/me/avatar"],
  ["GET", "/api/v1/users/me/addresses"],
  ["POST", "/api/v1/users/me/addresses"],
  ["PATCH", "/api/v1/users/me/addresses/:id"],
  ["DELETE", "/api/v1/users/me/addresses/:id"],
  ["GET", "/api/v1/users"],
  ["GET", "/api/v1/users/:id"],
  ["PATCH", "/api/v1/users/:id"],
];
let p2miss = 0;
p2.forEach(([m, p]) => {
  const found = users.find((e) => e.method === m && e.full === p);
  if (!found) p2miss++;
  console.log(`  ${m.padEnd(6)} ${p.padEnd(40)} ${found ? "OK" : "MISSING"}`);
});

console.log("\n=== Summary ===");
console.log(`  Phase 1: ${p1.length - p1miss}/${p1.length} endpoints present`);
console.log(`  Phase 2: ${p2.length - p2miss}/${p2.length} endpoints present`);
