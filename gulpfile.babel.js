import gulp from 'gulp'
import del from 'del'
import rename from 'gulp-rename'
import plumber from 'gulp-plumber'
import size from 'gulp-size'
import svgmin from 'gulp-svgmin'
import svgstore from 'gulp-svgstore'
import cheerio from 'gulp-cheerio'
import postcss from 'gulp-postcss'
import cssnext from 'postcss-cssnext'
import atImport from 'postcss-import'
import papply from 'postcss-apply'
import uncss from 'postcss-uncss'
import nano from 'cssnano'
import imagemin from 'gulp-imagemin'
import uglify from 'gulp-uglify'
import browserify from 'browserify'
import babelify from 'babelify'
import watchify from 'watchify'
import source from 'vinyl-source-stream'
import buffer from 'vinyl-buffer'
import browserSync from 'browser-sync'
import paths from './paths'

const spawn = require('child_process').spawn
const bs = browserSync.create()

// Asset Building

// Styles
// --------------------

const styles = () => {
  const processors = [
    atImport,
    cssnext({
      warnForDuplicates: false,
      browsers: ['last 2 version'],
      features: {
        colorFunction: true,
        customSelectors: true,
        rem: false
      }
    }),
    papply,
    uncss({
      html: ['./_site/**/*.html'],
      ignore: ['.c-entry', '.c-entry *']
    }),
    nano({
      autoprefixer: false,
      mergeRules: false,
      filterPlugins: false,
      discardComments: {
        removeAll: true
      }
    })
  ]

  return gulp.src(paths.css.src)
    .pipe(plumber())
    .pipe(postcss(processors))
    .pipe(size({
      showFiles: true,
      gzip: true
    }))
    .pipe(rename('bundle.css'))
    .pipe(gulp.dest(paths.css.dest))
    .pipe(gulp.dest('./_site/assets/dist/'))
    .pipe(bs.stream())
}

// Scripts
// --------------------

const bundler = watchify(browserify(paths.js.src, watchify.args))

function bundle () {
  return bundler
    .transform(babelify)
    .bundle()
    .pipe(source('./bundle.js'))
      .pipe(buffer())
      .pipe(uglify())
      .pipe(size({
        showFiles: true,
        gzip: true
      }))
    .pipe(gulp.dest(paths.js.dest))
    .pipe(gulp.dest('./_site/assets/dist/scripts/'))
    .pipe(bs.stream())
}

bundler.on('update', bundle)

const scripts = bundle

// Image Processing
// --------------------

const images = () => {
  return gulp.src(paths.img.src)
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{ removeViewBox: false }]
    }))
    .pipe(size({
      showFiles: true,
      gzip: true
    }))
    .pipe(gulp.dest(paths.img.dest))
    .pipe(gulp.dest('./_site/assets/dist/img/'))
    .pipe(bs.stream())
}

// Icons as SVG Sprite
// --------------------

const icons = () => {
  return gulp.src(paths.icons.src)
    .pipe(svgmin())
    .pipe(svgstore({
      fileName: 'meta-icons.svg',
      inlineSvg: true
    }))
    .pipe(cheerio({
      run: ($, file) => {
        $('svg').addClass('u-none')
        $('[fill]').removeAttr('fill')
      },
      parserOptions: { xmlMode: true }
    }))
    .pipe(rename('meta-icons.svg'))
    .pipe(gulp.dest(paths.icons.dest))
    .pipe(bs.stream())
}

// Jekyll
// --------------------

const jekyll = () => {
  return spawn('jekyll', ['build', '--drafts'], { stdio: 'inherit' }).on('close', () => {
    bs.notify('Jekyll Built!')
  })
}

const templates = () => {
  return gulp.src('./_site/').pipe(bs.stream())
}

const rejekyll = gulp.series(jekyll, templates)

// Clean Build Directory
// --------------------

const clean = () => del(paths.build)

// Server
// --------------------

const connect = () => bs.init({
  port: 8080,
  server: {
    baseDir: paths.build
  }
})

// Watch
// --------------------

const watch = () => {
  gulp.watch(paths.css.all, styles)
  gulp.watch(paths.js.all, scripts)
  gulp.watch(paths.markup, rejekyll)
  gulp.watch(paths.icons.src, icons)
  gulp.watch(paths.img.src, images)
}

// Default Tasks
// --------------------

const build = gulp.parallel(styles, scripts, icons, images)

// Exports Functions as Proper Tasks

export {
  build,
  clean,
  styles,
  scripts,
  icons,
  images,
  watch,
  connect,
  jekyll,
  rejekyll
}

const all = gulp.series(clean, jekyll, gulp.parallel(build, connect, watch))

export default all
