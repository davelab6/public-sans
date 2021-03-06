/*
* * * * * ==============================
* * * * * ==============================
* * * * * ==============================
* * * * * ==============================
========================================
========================================
========================================
----------------------------------------
USWDS SASS GULPFILE
----------------------------------------
*/
const autoprefixer = require("autoprefixer");
const autoprefixerOptions = require("./node_modules/uswds-gulp/config/browsers");
const cssnano = require("cssnano");
const gulp = require("gulp");
const mqpacker = require("css-mqpacker");
const path = require("path");
const pkg = require("./node_modules/uswds/package.json");
const postcss = require("gulp-postcss");
const rename = require("gulp-rename");
const replace = require("gulp-replace");
const sass = require("gulp-sass");
const sourcemaps = require("gulp-sourcemaps");
const uswds = require("./node_modules/uswds-gulp/config/uswds");
const watch = require("gulp-watch");

/*
----------------------------------------
PATHS
----------------------------------------
- All paths are relative to the
  project root
- Don't use a trailing `/` for path
  names
----------------------------------------
*/

// Project Sass source directory
const PROJECT_SASS_SRC = "./site/_sass";

// Images destination
const IMG_DEST = "./site/assets/uswds/img";

// Fonts destination
const FONTS_DEST = "./site/assets/uswds/fonts";

// Javascript destination
const JS_DEST = "./site/assets/uswds/js";

// Compiled CSS destination
const CSS_DEST = "./site/assets/css";

// Webfonts
const WEBFONTS_SRC = "./binaries/webfonts";
const WEBFONTS_DEST = "./site/assets/fonts";

/*
----------------------------------------
TASKS
----------------------------------------
*/

gulp.task("copy-uswds-setup", () => {
  return gulp
    .src(`${uswds}/scss/theme/**/**`)
    .pipe(gulp.dest(`${PROJECT_SASS_SRC}`));
});

gulp.task("copy-uswds-fonts", () => {
  return gulp.src(`${uswds}/fonts/**/**`).pipe(gulp.dest(`${FONTS_DEST}`));
});

gulp.task("copy-uswds-images", () => {
  return gulp.src(`${uswds}/img/**/**`).pipe(gulp.dest(`${IMG_DEST}`));
});

gulp.task("copy-uswds-js", () => {
  return gulp.src(`${uswds}/js/**/**`).pipe(gulp.dest(`${JS_DEST}`));
});

gulp.task("build-sass", function(done) {
  var plugins = [
    // Autoprefix
    autoprefixer(autoprefixerOptions),
    // Pack media queries
    mqpacker({ sort: true }),
    // Minify
    cssnano({ autoprefixer: { browsers: autoprefixerOptions } })
  ];
  return gulp
    .src([`${PROJECT_SASS_SRC}/*.scss`])
    .pipe(sourcemaps.init({ largeFile: true }))
    .pipe(
      sass({
        includePaths: [
          `${PROJECT_SASS_SRC}`,
          `${uswds}/scss`,
          `${uswds}/scss/packages`
        ]
      })
    )
    .pipe(replace(/\buswds @version\b/g, "based on uswds v" + pkg.version))
    .pipe(postcss(plugins))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(`${CSS_DEST}`))
    .pipe(gulp.dest("./_site/assets/css"));
});

gulp.task(
  "init",
  gulp.series(
    "copy-uswds-setup",
    "copy-uswds-fonts",
    "copy-uswds-images",
    "copy-uswds-js",
    "build-sass"
  )
);

gulp.task("copy-webfonts", () => {
  return gulp.src(`${WEBFONTS_SRC}/**/**`).pipe(gulp.dest(WEBFONTS_DEST));
});

gulp.task("watch-webfonts", () => {
  gulp
    .src(`${WEBFONTS_SRC}/**/*`, { base: WEBFONTS_SRC })
    .pipe(watch(WEBFONTS_SRC, { base: WEBFONTS_SRC }))
    .pipe(gulp.dest(WEBFONTS_DEST));
});

gulp.task("watch-sass", function() {
  gulp.watch(`${PROJECT_SASS_SRC}/**/*.scss`, gulp.series("build-sass"));
});

gulp.task(
  "watch",
  gulp.series(
    "copy-webfonts",
    "build-sass",
    gulp.parallel("watch-sass", "watch-webfonts")
  )
);

gulp.task("default", gulp.series("watch"));
