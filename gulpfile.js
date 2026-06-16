const pump = require("pump");

// Gulp Plugins.

const { series, watch, src, dest, parallel } = require("gulp");
const livereload = require("gulp-livereload");
const postcss = require("gulp-postcss");
const zip = require("gulp-zip");
const uglify = require("gulp-uglify");
const beeper = require("beeper");

// PostCSS plugins.

const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const customProperties = require("postcss-custom-properties");
const easyimport = require("postcss-easy-import");
const purgecss = require("@fullhuman/postcss-purgecss");

// Tailwind.

const tailwind = require("tailwindcss");
const tailwindTypo = require("@tailwindcss/typography");
const tailwindLineClamp = require("@tailwindcss/line-clamp");

function serve(done) {
    livereload.listen();
    done();
}

function handleError(done) {
    return function (err) {
        if (err) beeper();
        return done(err);
    };
}

const grayPallette = {
    "black-1": "var(--black-1)",
    "black-2": "var(--black-2)",
    "white-1": "var(--white-1)",
    "white-2": "var(--white-2)",
};

function css(done, dev) {
    const devProccesors = [
        tailwind({
            plugins: [tailwindTypo, tailwindLineClamp],
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        primary: "var(--primary-color)",
                    },
                    textColor: {
                        primary: "var(--primary-color)",
                    },
                    backgroundColor: grayPallette,
                    borderColor: {
                        primary: "var(--primary-color)",
                    },
                    flex: {
                        full: "1 0 100%",
                    },
                    height: {
                        100: "28.5rem",
                        102: "30rem",
                        "60vh": "60vh",
                    },
                    minHeight: {
                        75: "75vh",
                    },
                    boxShadow: {
                        "3xl": "0 35px 60px -15px rgba(0, 0, 0, 0.3)",
                    },
                    typography: (theme) => ({
                        DEFAULT: {
                            css: {
                                a: {
                                    color: "var(--primary-color)",
                                    textDecoration: "none",
                                    "&:hover": {
                                        color: theme("colors.black"),
                                    },
                                    "& strong": {
                                        color: "var(--primary-color)",
                                    },
                                    "&:hover strong": {
                                        color: theme("colors.black"),
                                    },
                                },
                                blockquote: {
                                    fontFamily: "font-serif",
                                    borderLeftColor: "var(--primary-color)",
                                    paddingLeft: "2rem",
                                    fontSize: "1.6rem",
                                    lineHeight: "1.5",
                                },
                                img: {
                                    borderRadius: "0.375rem",
                                },
                                figure: {
                                    "& figcaption": {
                                        color: theme("colors.gray.500"),
                                        fontWeight: "300",
                                    },
                                    "& pre": {
                                        marginBottom: "0",
                                    },
                                },
                                strong: {
                                    "& a": {
                                        color: "var(--primary-color)",
                                    },
                                    "&:hover a": {
                                        color: theme("colors.black"),
                                    },
                                },
                            },
                        },
                        xl: {
                            css: {
                                blockquote: {
                                    paddingLeft: "2rem",
                                    fontSize: "1.6rem",
                                    lineHeight: "1.5",
                                },
                                figure: {
                                    "& figcaption": {
                                        fontSize: "1.2rem",
                                    },
                                },
                            },
                        },
                        dark: {
                            css: {
                                color: theme("colors.gray.300"),
                                '[class~="lead"]': { color: theme("colors.gray.400") },
                                a: {
                                    color: "var(--primary-color)",
                                    textDecoration: "none",
                                    "&:hover": {
                                        color: theme("colors.white"),
                                    },
                                    "& strong": {
                                        color: "var(--primary-color)",
                                    },
                                    "&:hover strong": {
                                        color: theme("colors.white"),
                                    },
                                },
                                strong: {
                                    color: theme("colors.gray.100"),
                                    "& a": {
                                        color: "var(--primary-color)",
                                    },
                                    "&:hover a": {
                                        color: theme("colors.white"),
                                    },
                                },
                                "ul > li::before": {
                                    backgroundColor: theme("colors.gray.700"),
                                },
                                hr: { borderColor: theme("colors.gray.800") },
                                blockquote: {
                                    color: theme("colors.gray.100"),
                                    borderLeftColor: "var(--primary-color)",
                                },
                                p: {
                                    color: theme("colors.gray.300"),
                                },
                                h1: { color: theme("colors.gray.100") },
                                h2: { color: theme("colors.gray.100") },
                                h3: { color: theme("colors.gray.100") },
                                h4: { color: theme("colors.gray.100") },
                                h5: { color: theme("colors.gray.100") },
                                h6: { color: theme("colors.gray.100") },
                                code: { color: theme("colors.gray.100") },
                                "a code": { color: theme("colors.gray.100") },
                                pre: {
                                    color: theme("colors.gray.200"),
                                    backgroundColor: theme("colors.gray.800"),
                                },
                                thead: {
                                    color: theme("colors.gray.100"),
                                    borderBottomColor: theme("colors.gray.700"),
                                },
                                "tbody tr": {
                                    borderBottomColor: theme("colors.gray.800"),
                                },
                            },
                        },
                    }),
                },
                fontFamily: {
                    serif: ['"Libre BaskerVille"', "ui-serif", "Georgia"],
                    sans: ["Nunito", "Helvetica", "Arial", "sans-serif"],
                },
                container: {
                    center: true,
                },
            },
            variants: {
                extend: {
                    display: ["dark"],
                    maxHeight: ["group-hover"],
                    translate: ["group-hover"],
                    borderColor: ["active", "focus"],
                    typography: ["dark"],
                    borderColor: ["active", "focus"],
                    pointerEvents: ["group-hover"],
                },
            },
        }),
        easyimport,
        customProperties({ preserve: true }),
    ];

    const prodProcessors = [
        autoprefixer(),
        cssnano(),
        purgecss({
            content: ["./*.hbs", "./**/*.hbs", "./assets/css/*.css", "./assets/js/*.js"],
            keyframes: true,
            variables: true,
            defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
            safelist: {
                greedy: [/prose/, /prose-dark/, /prose-xl/, /prose-lg/, /xl:prose-xl/, /lg:prose-lg/, /figure/]
            },
        }),
    ];

    pump(
        [
            src("assets/css/*.css", {
                sourcemaps: false,
            }),
            postcss(dev ? devProccesors : devProccesors.concat(prodProcessors)),
            dest("assets/built/css", { sourcemaps: false }),
            livereload(),
        ],
        handleError(done)
    );
}

function hbs(done) {
    pump([src(["*.hbs", "partials/**/*.hbs"]), livereload()], handleError(done));
}

function js(done) {
    pump(
        [
            src(["assets/js/lib/*.js", "assets/js/*.js"], { sourcemaps: true }),
            uglify(),
            dest("assets/built/js", { sourcemaps: "." }),
            livereload(),
        ],
        handleError(done)
    );
}

function zipper(done) {
    const targetDir = "dist/";
    const themeName = require("./package.json").name;
    const filename = themeName + ".zip";
    pump(
        [
            src(["**", "!node_modules", "!node_modules/**", "!dist", "!dist/**"]),
            zip(filename),
            dest(targetDir),
        ],
        handleError(done)
    );
}

const hbsWatcher = () => watch(["*.hbs", "partials/**/*.hbs"], hbs);
const cssWatcher = () => watch(["assets/css/**"], (done) => css(done, true));
const jsWatcher = () => watch("assets/js/**", js);

/* Configuring Tasks. */

const watcher = parallel(jsWatcher, hbsWatcher, cssWatcher);
const build = series((done) => css(done, false), js);
const dev = series(build, serve, watcher);

exports.build = build;
exports.zip = series(build, zipper);
exports.default = dev;
