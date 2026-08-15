/**
 * Harness for recommendations-ui.test.tsx: installs the next/navigation
 * mock (recording pushes into globalThis.__pushes) BEFORE the bundled
 * test body is required (esbuild hoists requires to the top of the
 * bundle, so interception must live in an outer module).
 */
const Module = require("node:module");
const pushes = [];
const origLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === "next/navigation") {
    return {
      useSearchParams: () => new URLSearchParams(),
      useRouter: () => ({ push: (href) => pushes.push(href), replace: () => {} }),
      usePathname: () => "/",
    };
  }
  return origLoad.apply(this, arguments);
};
globalThis.__pushes = pushes;
require("../.tmp-rec-test.cjs");
