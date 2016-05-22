var gulp = require('gulp');
var args = require('yargs').argv;
var config = require('./gulp.config')();
var del = require('del');


var $ = require('gulp-load-plugins')({lazy: true});

// var jshint = require('gulp-jshint');
// var jscs = require('gulp-jscs');
// var util = require('gulp-util');
// var gulpprint = require('gulp-print');
// var gulpif = require('gulp-if');

gulp.task('vet', function () {  
    log('Analyzing source with JSHint and JSCS');
    return   gulp
        .src(config.alljs)  
        .pipe($.if(args.verbose, $.print()))
        .pipe($.jscs())
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish', {verbose:true}))
        .pipe($.jshint.reporter('fail'));
});
//['clean-styles'],
gulp.task('styles',  function () {
   log('Compiling less ----> css'); 
   
   return gulp
        .src(config.less)
        .pipe($.plumber())
        .pipe($.less())
       // .on('error', errorLogger)
        .pipe($.autoprefixer({ browsers:['last 2 version','> 5%' ] }))
        .pipe(gulp.dest(config.temp));
});

gulp.task('wiredep', function () {
    log('wire up the bower css js and our app js into html');
    
   var options = config.getWiredepDefaultOptions(); 
   var wiredep = require('wiredep').stream;
   return gulp
   .src(config.index)
   .pipe(wiredep(options))
   .pipe($.inject(gulp.src(config.js)))
   .pipe(gulp.dest(config.client));
});

gulp.task('inject',['wiredep', 'styles'], function () {
     log('wire up the app css  and our into html and call wiredep');
    
   return gulp
   .src(config.index)
   .pipe($.inject(gulp.src(config.css)))
   .pipe(gulp.dest(config.client));
});



gulp.task('clean-styles',function (done) {
    var files  = config.temp + '**/*.css';
    clean(files,done);
});


gulp.task('less-watcher', function () {
   gulp.watch([config.less], ['styles']); 
});

function errorLogger(error) {
    log('***** Start of Error ******');
    log(error);
    log('***** End of Error ******');
    this.emit('end');
}

function clean(path, done) {
    log('cleaning :' + $.util.colors.blue(path));
    del(path,done);
}



gulp.task('hello', function () {
    console.log('kankan');
});

function log(msg) {
    if(typeof(msg) === 'object'){
        for(var item in msg){
            if(msg.hasOwnProperty(item)){
                $.util.log($.util.colors.blue(msg[item]));
            }
        }   
    }
    else{
        $.util.log($.util.colors.blue(msg));
    }
}