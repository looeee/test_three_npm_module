const gulp = require('gulp');
const watch = require('gulp-watch');
const gutil = require('gulp-util');
const livereload = require('gulp-livereload');

const rollup = require('rollup').rollup;
const babel = require('rollup-plugin-babel');
const nodeResolve = require('rollup-plugin-node-resolve');
const filesize = require('rollup-plugin-filesize');
const commonjs = require('rollup-plugin-commonjs');
const uglify = require('rollup-plugin-uglify');

const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');

const outro = `
Object.defineProperty( exports, 'AudioContext', {
	get: function () {
		return exports.getAudioContext();
	}
});`;

//Compile glsl code
const glsl = () => {
  return {
    transform(code, id) {
      if (!/\.glsl$/.test(id)) return;

      return 'export default ' + JSON.stringify(
        code
        .replace(/[ \t]*\/\/.*\n/g, '')
        .replace(/[ \t]*\/\*[\s\S]*?\*\//g, '')
        .replace(/\n{2,}/g, '\n')
      ) + ';';
    },
  };
};

gulp.task('vendorBundle', () => {
  return rollup({
    entry: './src/vendorBundle.js',
    plugins: [
      nodeResolve({
        jsnext: true,
        module: true,
        browser: true,
      }),
      commonjs({
        exclude:
        [
          'node_modules/modular-three/**',
        ],
      }),
      glsl(),
      babel({
        compact: false,
        exclude: 'node_modules/**',
        babelrc: false,
        presets: ['es2015-loose-rollup'],
      }),
      gutil.log('Pre and post-uglify filesizes:'),
      filesize(),
      //Disabled for development
      // uglify(),
      // filesize(),
    ],
    outro,
  })
    .then((bundle) => {
      return bundle.write({
        format: 'iife',
        // moduleName: 'modularThreeBoilerpate',
        dest: 'scripts/vendorBundle.js',
      });
      //
    });
});


gulp.task('bundle', () => {
  return rollup({
    entry: './src/entry.js',
    plugins: [
      nodeResolve({
        jsnext: true,
        module: true,
        browser: true,
      }),
      commonjs(),
      babel({
        compact: false,
        exclude: 'node_modules/**',
        babelrc: false,
        presets: ['es2015-loose-rollup'],
      }),
      gutil.log('Pre and post-uglify filesizes:'),
      filesize(),
      //Disabled for development
      // uglify(),
      // filesize(),
    ],
  })
    .then((bundle) => {
      return bundle.write({
        format: 'iife',
        // moduleName: 'modularThreeBoilerpate',
        dest: 'scripts/main.js',
      });
      //
    });
});

//Compile SCSS to CSS and apply autoprefixer
gulp.task('sass', () => {
  return gulp.src('scss/**/*.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(autoprefixer({
      browsers: ['last 3 version', 'ie 9'],
      cascade: true,
    }))
    .pipe(gulp.dest('styles/'))
    .pipe(livereload());
});

gulp.task('reload', () => {
  gulp.src(['./**/*.html', './**/*.php', '!node_modules/**/*.*'], {
    read: false,
  })
  .pipe(livereload());
});

//Note: this will rebuild js when gulp is first run.
//Remove 'bundle' to prevent this and just watch for changes
gulp.task('default', ['bundle'], () => {
  livereload.listen();
  gulp.watch('scss/**/*.scss', ['sass']);
  gulp.watch('src/**/*.js', ['bundle']);
  gulp.watch('src/**/vendorBundle.js', ['vendorBundle']);

  //This is to aid development of modularTHREE module
  gulp.watch('node_modules/modular-three/dist/index.js', ['vendorBundle']);

  gulp.watch('scripts/**/*.js', ['reload']);
  gulp.watch('./index.html', ['reload']);
});
