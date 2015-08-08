/* global System */

System.config({
  packages: {
    "algebraic": {
      main: "index",
      format: "register",
      map: {
        ".": System.normalizeSync("{reify:algebraic}/src"),
      },
    },
  },
});
