
var gulp = require("gulp");
var babel = require("gulp-babel");
var extReplace = require("gulp-ext-replace");
var tape = require("gulp-tape");
var shell = require('gulp-shell')

gulp.task("build", function () {
  return gulp.src(["src/**/*.import.js", "index.import.js"])
    .pipe(babel())
    .pipe(extReplace(".js", ".import.js"))
    .pipe(gulp.dest("lib"));
});

gulp.task("test", ["build"], function () {
  return gulp.src("tests/*.js")
    .pipe(babel())
    .pipe(gulp.dest("lib/test"))
    .pipe(tape())
});
