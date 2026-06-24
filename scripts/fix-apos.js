const fs = require("fs");
const path = require("path");

const dirs = ["E:/test/client/src", "E:/test/worker/src", "E:/test/admin/src"];

function walk(p) {
  for (const e of fs.readdirSync(p, { withFileTypes: true })) {
    const f = path.join(p, e.name);
    if (e.isDirectory()) walk(f);
    else if (/\.(ts|tsx)$/.test(e.name)) {
      let c = fs.readFileSync(f, "utf8");
      const o = c;
      // Replace &apos; outside of JSX (in JS string literals)
      // Heuristic: in TSX files, &apos; inside JSX text is valid; outside JSX it's not.
      // Safer: just check if the line contains a backtick or quote before &apos;
      const lines = c.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes("&apos;")) {
          // Replace with proper apostrophe
          lines[i] = line.split("&apos;").join("'");
        }
      }
      c = lines.join("\n");
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
