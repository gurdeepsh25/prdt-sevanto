const fs = require("fs");
const path = require("path");

const dirs = ["E:/test/client/src", "E:/test/worker/src", "E:/test/admin/src"];
const replacements = [
  ["@/components\\auth\\auth-form", "@/components/auth/auth-form"],
  ["@/components\\auth\\auth-shell", "@/components/auth/auth-shell"],
  ["@/components\\ui\\form-field", "@/components/ui/form-field"],
  ["@/components\\ui\\input", "@/components/ui/input"],
  ["@/components\\ui\\button", "@/components/ui/button"],
];

function walk(p) {
  for (const e of fs.readdirSync(p, { withFileTypes: true })) {
    const f = path.join(p, e.name);
    if (e.isDirectory()) walk(f);
    else if (/\.(ts|tsx)$/.test(e.name)) {
      let c = fs.readFileSync(f, "utf8");
      const o = c;
      for (const [from, to] of replacements) {
        c = c.split(from).join(to);
      }
      if (c !== o) {
        fs.writeFileSync(f, c);
        console.log("fixed:", f);
      }
    }
  }
}

for (const dir of dirs) {
  if (fs.existsSync(dir)) walk(dir);
}
console.log("done");
