const fs = require("fs");
const path = "E:/test/server/src/modules/users/users.routes.ts";
let c = fs.readFileSync(path, "utf8");
const matches = c.match(/params:\s*\{\s*id:\s*uuid\s*\}/g);
console.log("matches:", matches);
if (matches) {
  c = c.replace(/params:\s*\{\s*id:\s*uuid\s*\}/g, "params: idParamSchema");
  fs.writeFileSync(path, c);
  console.log("written");
} else {
  console.log("no match");
}
