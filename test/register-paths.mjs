import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { registerHooks } from "node:module";

const root = path.resolve("C:/Users/Silver/Desktop/tradeinfinder.com");

function resolveAlias(specifier) {
  const base = path.join(root, "src", specifier.slice(2));
  const candidates = [base, `${base}.ts`, `${base}.tsx`, path.join(base, "index.ts"), path.join(base, "index.tsx")];
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const resolvedPath = resolveAlias(specifier);
      if (resolvedPath) {
        return {
          shortCircuit: true,
          url: pathToFileURL(resolvedPath).href,
        };
      }
    }

    return nextResolve(specifier, context);
  },
});
