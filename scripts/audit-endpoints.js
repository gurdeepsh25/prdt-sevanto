const fs = require("fs");

function parseRouteFile(path) {
  const src = fs.readFileSync(path, "utf8");
  // Collapse `router.METHOD(\n  "path",` into single line.
  const re = /router\.(get|post|put|patch|delete)\(\s*['"]([^'"]+)['"]/g;
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
// Parse workers routes file but combine default + admin + skills into one logical list.
const workersSrc = fs.readFileSync(
  "e:/test/server/src/modules/workers/workers.routes.ts",
  "utf8",
);
const parseFrom = (source, prefix, name) => {
  // Match either: router.METHOD("path",  OR  router.METHOD(\n  "path",
  const reSingle = new RegExp(
    `${name}\\.(get|post|put|patch|delete)\\((['"][^'"]+['"])`,
    "g",
  );
  const reMulti = new RegExp(
    `${name}\\.(get|post|put|patch|delete)\\([\\r\\n\\s]*(['"][^'"]+['"])`,
    "g",
  );
  const seen = new Set();
  const out = [];
  const push = (m) => {
    if (seen.has(m.index)) return;
    seen.add(m.index);
    const path = m[2].slice(1, -1); // strip surrounding quotes
    out.push({
      method: m[1].toUpperCase(),
      path,
      full: `/api/v1${prefix}${path === "/" ? "" : path}`,
    });
  };
  for (const m of source.matchAll(reSingle)) push(m);
  for (const m of source.matchAll(reMulti)) push(m);
  return out;
};
const defaultRoutes = parseFrom(workersSrc, "/workers", "router");
const adminRoutes = parseFrom(workersSrc, "/admin/workers", "adminRouter");
const skillRoutes = parseFrom(workersSrc, "/skills", "skillsRouter");
const workers = [...defaultRoutes, ...adminRoutes, ...skillRoutes];

// DEBUG: print all parsed routes
console.log("DEBUG default:", JSON.stringify(defaultRoutes));
console.log("DEBUG admin:", JSON.stringify(adminRoutes));
console.log("DEBUG skill:", JSON.stringify(skillRoutes));

console.log("=== Auth endpoints ===");
auth.forEach((e) => console.log(`  ${e.method.padEnd(6)} ${e.full}`));
console.log(`  Total: ${auth.length}\n`);

console.log("=== User endpoints ===");
users.forEach((e) => console.log(`  ${e.method.padEnd(6)} ${e.full}`));
console.log(`  Total: ${users.length}\n`);

console.log("=== Worker endpoints (Phase 3) ===");
workers.forEach((e) => console.log(`  ${e.method.padEnd(6)} ${e.full}`));
console.log(`  Total: ${workers.length}\n`);

const all = auth.concat(users, workers);

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

console.log("\n=== Phase 3 spec endpoints ===");
const p3 = [
  ["GET", "/api/v1/workers"],
  ["GET", "/api/v1/workers/:id"],
  ["GET", "/api/v1/workers/me"],
  ["PUT", "/api/v1/workers/me"],
  ["PATCH", "/api/v1/workers/me"],
  ["PUT", "/api/v1/workers/me/skills"],
  ["GET", "/api/v1/workers/me/portfolio"],
  ["POST", "/api/v1/workers/me/portfolio"],
  ["DELETE", "/api/v1/workers/me/portfolio/:id"],
  ["GET", "/api/v1/skills"],
  ["GET", "/api/v1/admin/workers/pending"],
  ["POST", "/api/v1/admin/workers/:id/verify"],
];
let p3miss = 0;
p3.forEach(([m, p]) => {
  const found = workers.find((e) => e.method === m && e.full === p);
  if (!found) p3miss++;
  console.log(`  ${m.padEnd(6)} ${p.padEnd(50)} ${found ? "OK" : "MISSING"}`);
});

console.log("\n=== Final Summary ===");
console.log(`  Phase 1: ${p1.length - p1miss}/${p1.length} endpoints present`);
console.log(`  Phase 2: ${p2.length - p2miss}/${p2.length} endpoints present`);
console.log(`  Phase 3: ${p3.length - p3miss}/${p3.length} endpoints present`);
console.log(
  `  TOTAL : ${p1.length + p2.length + p3.length - p1miss - p2miss - p3miss}/${p1.length + p2.length + p3.length} endpoints implemented`,
);
