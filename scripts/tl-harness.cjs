/**
 * Harness: installs the next/navigation mock BEFORE the bundled test body
 * is required (esbuild hoists its requires to the top of the bundle, so the
 * interception must live in an outer module).
 */
const Module = require("node:module");
const origLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === "next/navigation") {
    return {
      useSearchParams: () => new URLSearchParams(),
      useRouter: () => ({ push: () => {}, replace: () => {} }),
      usePathname: () => "/",
    };
  }
  return origLoad.apply(this, arguments);
};
require("../.tmp-tl-test.cjs");
