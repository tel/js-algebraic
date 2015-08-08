Package.describe({
  name: "reify:algebraic",
  version: "0.0.9",
  summary: "Algebraic module specification for Javascript",
  git: "",
  documentation: "README.md",
});

Package.onUse(function(api) {
  api.versionsFrom("1.1.0.2");
  api.use("universe:modules@0.4.0");

  api.addFiles([
    "src/Completions/Defaults.import.js",
    "src/Completions/Foldable.import.js",

    "src/Naive.import.js",
    "src/Boolean.import.js",
    "src/String.import.js",
    "src/Number.import.js",
    "src/Integer.import.js",
    "src/Natural.import.js",

    "src/Array.import.js",
    "src/Set.import.js",
    "src/Dict.import.js",
    "src/Trie.import.js",
    "src/Validation.import.js",

    "src/Either.import.js",

    "src/Utils.import.js",

    "src/index.import.js",

    "meteor/system.js",
  ]);
});

Package.onTest(function(api) {
  api.use("tinytest");
  api.use("reify:algebraic");
  api.use("reify:test-helpers");
  api.use("universe:modules@0.4.0");

  api.addFiles([
    "tests/examples.import.js",
    "tests/helpers.import.js",

    "tests/String.import.js",
    "tests/Array.import.js",
    "tests/SetOfDecidable.import.js",
    "tests/SetOfHashable.import.js",

    "tests/all.js",
  ]);
});
