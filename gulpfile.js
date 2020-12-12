"use strict";

const { src, dest } = require("gulp");
const gulp = require("gulp");
const autoprefixer = require("gulp-autoprefixer");
const browsersync = require("browser-sync").create();
const del = require("del");
const cssbeautify = require("gulp-cssbeautify");
const cssnano = require("gulp-cssnano");
const imagemin = require("gulp-imagemin");
const plumber = require("gulp-plumber"); //понять как это работает (ловим ошибки, чтобы не прервался watch)
const rename = require("gulp-rename");
const rigger = require("gulp-rigger"); //понять как это работает (позволяет импортировать один файл в другой простой конструкцией)
const removeComments = require("gulp-strip-css-comments");
const uglify = require("gulp-uglify");
const panini = require("panini");
const sass = require("gulp-sass");
const sourcemaps = require("gulp-sourcemaps");
const notify = require("gulp-notify"); //понять как это работает (выводит ошибки при сборке Gulp в виде системных сообщений)


var path = {
    build: {
        html: "_assets/",
        js: "_assets/js/",
        css: "_assets/css/",
        images: "_assets/img/"
    },
    src: {
        html: "_sourse/*.html",
        js: "_sourse/js/*.js",
        css: "_sourse/sass/style.scss",
        images: "_sourse/img/**/*.{jpg,png,svg,gif,ico}"
    },
    watch: {
        html: "_sourse/**/*.html",
        js: "_sourse/js/**/*.js",
        css: "_sourse/sass/**/*.scss",
        images: "_sourse/img/**/*.{jpg,png,svg,gif,ico}"
    },
    clean: "./_assets"
}

function browserSync(done) {
    browsersync.init({
        server: {
            baseDir: "_assets/"
        },
        port: 3000
    })
}

function browserSyncReload(done) {
    browsersync.reload();
}

function html() {
    panini.refresh()
    return src(path.src.html, { base: "_sourse/" })
        .pipe(plumber())
        .pipe(panini({
            root: '_sourse/',
            layouts: '_sourse/templates/layouts/',
            partials: '_sourse/templates/partials/',
            helpers: '_sourse/templates/helpers/',
            data: '_sourse/templates/data/'
        }))
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream());
}

function css() {
    return src(path.src.css, { base: "_sourse/sass/" })
        .pipe(sourcemaps.init())
        .pipe(plumber())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 versions'],
            cascade: true
        }))
        .on("error", notify.onError({
            title: "Style Error"
        }))
        .pipe(cssbeautify())
        .pipe(dest(path.build.css))
        .pipe(cssnano({
            zindex: false,
            discardComments: {
                removeAll: true
            }
        }))
        .pipe(removeComments())
        .pipe(rename({
            suffix: ".min",
            extname: ".css"
        }))
        .pipe(sourcemaps.write("./maps"))
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream());
}

function js() {
    return src(path.src.js, { base: "_sourse/js/" })
        .pipe(sourcemaps.init())
        .pipe(plumber())
        .pipe(rigger())
        .on("error", notify.onError({
            title: "Script Error"
        }))
        .pipe(gulp.dest(path.build.js))
        .pipe(uglify())
        .pipe(rename({
            suffix: ".min",
            extname: ".js"
        }))
        .pipe(sourcemaps.write("./maps"))
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream());
}

function images() {
    return src(path.src.images)
        .pipe(imagemin())
        .pipe(dest(path.build.images));
}

function clean() {
    return del(path.clean);
}

function watchFiles() {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.images], images);
}

const build = gulp.series(clean, gulp.parallel(html, css, js, images));
const watch = gulp.parallel(build, watchFiles, browserSync);

exports.html = html;
exports.css = css;
exports.js = js;
exports.images = images;
exports.clean = clean;
exports.watch = watch;
exports.default = watch;