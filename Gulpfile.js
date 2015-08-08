
var gulp = require("gulp");
var babel = require("gulp-babel");
var extReplace = require('gulp-ext-replace');

gulp.task("build", function () {
  return gulp.src(["src/**/*.import.js", "index.import.js"])
    .pipe(babel())
    .pipe(extReplace(".js", ".import.js"))
    .pipe(gulp.dest("lib"));
});
