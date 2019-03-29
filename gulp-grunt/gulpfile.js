

'use strict';

// Include Gulp & Tools We'll Use
var gulp = require('gulp');
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var size    = require('gulp-size');
var merge   = require('merge-stream');
var concat  = require('gulp-concat');
var handlebars = require('gulp-compile-handlebars');
var fileinclude = require('gulp-file-include');
var modernizr = require('gulp-modernizr');
var print = require('gulp-print');

var AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

var assetPaths = {
  "local": "",
  "staging": "/staging/mac2010",
  "production": "/prod/mac2010"
};
var remotePaths = require("./remotePaths.json");
var buildMode = "local";
var revManifest = {};

// create a handlebars helper to look up
// fingerprinted asset by non-fingerprinted name
var handlebarOpts = {
    helpers: {
        assetPath: function (path, context) {
          if (buildMode != "production")
          {
            return [assetPaths[buildMode], path].join('/');
          } 
          else {
             if (context.data.root[path])
              {
                return [assetPaths[buildMode], context.data.root[path]].join('/');
              }
              else {
                console.log("Could not find file in rev manifest: " + path);
                return [assetPaths[buildMode], path].join('/');
              }
          }
        }
    }
};

// Generate file hashes (only when deploying to production)
gulp.task('generate-file-hashes', function () {
  var rev = require('gulp-rev');
  var path = require('path');
  //if (buildMode == "production") {
    console.log("Generating file hashes for cache busting");
    return gulp.src(["dist/css/**", "dist/images/**", "dist/js/**"], {base: path.join(process.cwd(), 'dist')})
    .pipe(rev())
    .pipe(rev.manifest())
    .pipe(gulp.dest('.'));
  //}
});

gulp.task('read-hash-manifest', function () {
  revManifest = require('./rev-manifest.json');
});

// Optimize Images
gulp.task('images', function () {
  var imagemin = require('gulp-imagemin');
  var newer = require('gulp-newer');
  return gulp.src(['submodules/redesign-2010/v2/web-imgs/**/*', 'source/images/**/*'])
    .pipe(newer('dist/images'))
    .pipe(imagemin({
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest('dist/images'))
    .pipe(size({title: 'images'}));
});

// Copy and (optionally) cachebust include files
// All dist js, css, and images must be in place prior to running
gulp.task('includes', function () {
  var includes = gulp.src(['source/includes/*.html']);
  return includes
    .pipe(handlebars(revManifest, handlebarOpts))
    .pipe(gulp.dest('dist/includes'))
});

// Copy All Sample Files (replacing includes and assets-base)
gulp.task('samples', function () {
  return gulp.src('source/samples/**/*', {
    dot: true
  })
  .pipe(fileinclude({   prefix: '@@',
                        basepath: 'dist/includes/'})) // Process includes
  //.pipe(handlebars(revManifest, handlebarOpts))
  .pipe(gulp.dest('dist/samples'))
    .pipe(size({title: 'Sample files'}));
});

// Compile and Automatically Prefix Stylesheets
gulp.task('styles', function () {
  var filter      = require('gulp-filter');
  var gulpif = require('gulp-if');
  var changed = require('gulp-changed');
  var rubySass = require('gulp-ruby-sass');
  var autoprefixer = require('gulp-autoprefixer');
  var cssmin = require('gulp-cssmin');
  // For best performance, don't add Sass partials to `gulp.src`
  return gulp.src([
    'source/scss/*.scss',
    'source/scss/**/*.css'
  ])
    .pipe(changed('styles', {extension: '.scss'}))
    .pipe(rubySass({
      style: 'expanded',
      precision: 10
    }))
    .on('error', console.error.bind(console))
    //.pipe(autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
    // Concatenate And Minify Styles
    .pipe(gulpif('*.css', cssmin()))
    .pipe(gulp.dest('dist/styles'))
    .pipe(size({title: 'styles'}))
    .pipe(filter('**/*.css')) // Filtering stream to only css files
    .pipe(browserSync.reload({stream:true}));;
});

// Clean Output Directory
gulp.task('clean', del.bind(null, ['dist/*', 'submodules/pattern-lab-php/source/*', 'rev-manifest.json', '!dist/.git']));

/* ======== TASKS FOR PATTERNLAB STYLEGUIDE GENERATION ========= */

gulp.task('generate-styleguide', function(cb) {
  runSequence('copy-patterns', 'build-styleguide', 'copy-styleguide', cb);
});
gulp.task('copy-patterns', function() {
  var copystream = gulp.src('source/patternlab/**/*')
                .pipe(gulp.dest('submodules/pattern-lab-php/source/'))
                .pipe(size({title: 'Patterns'}));
  return copystream;
});
gulp.task('build-styleguide', function(cb) {
  var exec = require('child_process').exec;
  var child = exec('php submodules/pattern-lab-php/core/builder.php -gp',
        function (error, stdout, stderr) {
          console.log("Finished PHP styleguide generation");
          //console.log(stdout);
          if (error !== null) {
            console.log(stderr);
            console.log('Error generating styleguide: ' + error);
          }
          cb(error);
        });
});
gulp.task('copy-styleguide', function() {
  // Copy result to dist
  var htmlStream = gulp.src('submodules/pattern-lab-php/public/**/*.html')
      .pipe(fileinclude({   prefix: '@@',
                            basepath: 'source/includes/'}))
      .pipe(handlebars(revManifest, handlebarOpts))
      .pipe(gulp.dest('dist/styleguide/'));

  var otherStream = gulp.src(['submodules/pattern-lab-php/public/**/*.*', '!**/*.html'])
    .pipe(gulp.dest('dist/styleguide/'));

  return merge(htmlStream, otherStream)
    .pipe(size({title: 'Styleguide size'}));
});

/* // ======== END PATTERNLAB TASKS ========= */


/* ======== TASKS FOR JAVASCRIPT ========= */

gulp.task('javascript', function() {
  var jshint = require('gulp-jshint');
  var uglify = require('gulp-uglify');
  var globaljs = gulp.src([
    "source/js/mac.jquery.*.js",
    "source/js/global.js"])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(concat('global.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'));
  var jslibs = gulp.src(["source/js/lib/**/*"])
    .pipe(gulp.dest('dist/js/lib'));;
  return merge(globaljs, jslibs)
    .pipe(size({"title": "scripts"}))
    .pipe(print())
    .pipe(modernizr({
        options: ['setClasses'],
        tests: ['csstransforms3d', 'csstransitions']
      }))
    .pipe(gulp.dest('dist/js'))
    .pipe(reload({stream:true}));
});

/* // ======== END JAVASCRIPT TASKS ========= */


gulp.task('rsync', function(cb) {
  var rsync = require('rsyncwrapper').rsync;
  console.log("Ready to push to " + remotePaths[buildMode]);
  rsync({
    ssh: true,
    src: './dist/',
    exclude: ['styleguide'],
    dest: remotePaths[buildMode],
    recursive: true,
    syncDest: false,
    args: ['--verbose']
    }, 
    function(error, stdout, stderr, cmd) {
      console.log(stdout);
      if (error)
        console.log(stderr);
      cb(error);
    });
  });

gulp.task('rsync-styleguide', function(cb) {
  var rsync = require('rsyncwrapper').rsync;
  console.log("Ready to push styleguide to " + remotePaths[buildMode]);
  rsync({
    ssh: true,
    src: './dist/styleguide/',
    dest: remotePaths[buildMode],
    recursive: true,
    syncDest: false,
    args: ['--verbose']
    }, 
    function(error, stdout, stderr, cmd) {
      console.log(stdout);
      if (error)
        console.log(stderr);
      cb(error);
    });
  });

gulp.task('hit-webapps', function(cb) {
  var curl = require('node-curl');
    curl(remotePaths['postDeployScript'], function(err) {
      console.info(this.status);
      console.info('-----');
      console.info(this.body);
      console.info('-----');
      console.info(this.info('SIZE_DOWNLOAD'));
      cb(err);
    });
  });

// Basic build task
gulp.task('build', ['clean'], function (cb) {
  runSequence(['styles', 'javascript', 'images'], 'generate-file-hashes', 'read-hash-manifest', 'generate-styleguide', 'includes', 'samples', cb);
});

// Watch Files For Changes & Reload
gulp.task('serve', ['build'], function () {
  browserSync({
    notify: false,
    server: { baseDir: ['dist/styleguide'], 
              directory: false, 
              index: "index.html",
            routes: {
                  "/samples": "dist/samples",
                  "/styles":  "dist/styles",
                  "/js":      "dist/js" 
              }
            }
  });
  gulp.watch(['source/scss/**/*.scss'], ['styles']);
  gulp.watch(['source/js/**/*.js', '!source/js/lib/**/*'], ['javascript']);
  gulp.watch(['source/images/**/*'], ['images', reload]);
  gulp.watch(['source/patternlab/**/*'], ['generate-styleguide', reload]);
  gulp.watch(['source/includes/*.html'], ['generate-styleguide', reload]);
});

// Build and push to staging
gulp.task('stage', [], function (cb) {
  buildMode = "staging";
  runSequence('build', 'rsync', 'rsync-styleguide', cb);
});

// Build and deploy!
gulp.task('deploy', [], function (cb) {
  buildMode = "production";
  runSequence('build', 'rsync', 'hit-webapps', cb);
});

// Build and run locally, the Default Task
gulp.task('default', [], function () {
  console.log("Options: ");
  console.log("gulp serve (Build for local testing)");
  console.log("gulp stage (Build and send to staging server)");
  console.log("gulp deploy (Build and send deploy to live server)");
  console.log("gulp clean (Clear out all built assets)");
});