var gulp = require('gulp');
var args = require('yargs').argv;
var config = require('./gulp.config')();
var del = require('del');
var port = process.env.PORT || config.defaultPort;
var browserSync = require('browser-sync');
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

gulp.task('serve-dev',['inject'], function () {
    var isDev = true;
    
   var nodeOptions={
       script: config.nodeServer,
       delayTime: 1,
       env:{
           'PORT':port,
           'NOE_ENV': isDev ? 'dev' : 'build'
       },
       watch:[config.server]
   };
   
   return $.nodemon(nodeOptions)
   .on('restart',['vet'], function (ev) {
        log('***  nodemon restarted');
        log('file changed on restart : \n' + ev);
   })
   .on('start', function () {
        log('***  nodemon started');
        startBrowserSync();
   })
   .on('crash', function () {
        log('***  nodemon crashed : script crashed for some reason');
   })
   .on('exit', function () {
        log('***  nodemon exited cleanly');
   });
});

function startBrowserSync() {
    if(browserSync.active){
        return;
    }
    log('starting browser-sync on port  ' + port );
    
    var options = {
        proxy : 'localhost:'+ port,
        port : 3000,
        files :[config.client + '**/*.*'],
        ghostMode:{
          clicks:true,
          location : false,
          forms:true,
          scroll:true,
        },
        injectChanges:true,
        logFileChanges: true,
        logLevel:'debug',
        logPrefix:'gulp-patterns',
        notify:true,
        reloadDelay:1000
    };
    
    browserSync(options);
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