// Smoke test: spin up server, hit /healthz and /openapi.json, then exit
process.env.NODE_ENV = "production";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/x";
process.env.JWT_ACCESS_SECRET = "test-access-secret-please-change-me-32chars";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-please-change-me-32chars";
process.env.MAIL_HOST = "localhost";
process.env.MAIL_PORT = "1025";

const { createApp } = require("./dist/app.js");
const app = createApp();

const srv = app.listen(3001, async () => {
  try {
    console.log("Server started on http://localhost:3001");
    const healthz = await fetch("http://localhost:3001/healthz");
    const hjson = await healthz.json();
    console.log("/healthz:", healthz.status, JSON.stringify(hjson));

    const openapi = await fetch("http://localhost:3001/openapi.json");
    const ojson = await openapi.json();
    console.log(
      "/openapi.json:",
      openapi.status,
      "OpenAPI",
      ojson.openapi,
      "—",
      ojson.info.title,
      "v" + ojson.info.version,
    );
    console.log("Registered paths:", Object.keys(ojson.paths).length);
    const expected = [
      "/auth/signup",
      "/auth/login",
      "/auth/refresh",
      "/auth/logout",
      "/auth/verify-email",
      "/auth/resend-verification",
      "/auth/forgot-password",
      "/auth/reset-password",
      "/users/me",
      "/users",
      "/users/{id}",
    ];
    const missing = expected.filter((p) => !ojson.paths[p]);
    if (missing.length === 0) {
      console.log("All canonical paths present in OpenAPI doc");
    } else {
      console.log("MISSING from OpenAPI:", missing);
    }

    const notFound = await fetch("http://localhost:3001/api/v1/does-not-exist");
    console.log("GET /api/v1/does-not-exist:", notFound.status);
    srv.close();
    process.exit(0);
  } catch (err) {
    console.error("Smoke test error:", err);
    srv.close();
    process.exit(1);
  }
});
