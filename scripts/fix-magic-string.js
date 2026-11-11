const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const pkgPath = path.join(__dirname, "../node_modules/magic-string/package.json");
const mjsPath = path.join(__dirname, "../node_modules/magic-string/dist/index.mjs");
const cjsPath = path.join(__dirname, "../node_modules/magic-string/dist/index.cjs");

if (fs.existsSync(pkgPath) && fs.existsSync(mjsPath)) {
  try {
    if (!fs.existsSync(cjsPath)) {
      execSync(`npx esbuild "${mjsPath}" --outfile="${cjsPath}" --format=cjs`, { stdio: "ignore" });
    }
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    pkg.main = "./dist/index.cjs";
    pkg.exports = {
      ".": {
        require: "./dist/index.cjs",
        import: "./dist/index.mjs",
        default: "./dist/index.cjs",
      },
      "./package.json": "./package.json",
    };
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    console.log("magic-string CJS patch applied successfully.");
  } catch (err) {
    console.warn("Could not patch magic-string:", err.message);
  }
}
