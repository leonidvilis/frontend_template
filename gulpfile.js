var gulp = require('gulp'),
    // Автоматическая перезагрузка при сохранении
    watch = require('gulp-watch'),
    // Автоматическая расстановка вендорных префиксов при компиляции css
    prefixer = require('gulp-autoprefixer'),
    // Включает пересборку js для поддержки EcmaScript6
    babel = require('gulp-babel'),
    // Минификация файлов js
    uglify = require('gulp-uglify'),
    // Препроцессор css - значительно сокращает написание кода
    stylus = require('gulp-stylus'),
    // Для создания sourcemap
    sourcemaps = require('gulp-sourcemaps'),
    // Минификация css
    cssmin = require('gulp-minify-css'),
    // Минификация картинок
    imagemin = require('gulp-imagemin'),
    //  Улучшение минификации png
    pngquant = require('imagemin-pngquant'),
    // Удаление директории сборки командой clean
    rimraf = require('rimraf'),
    // Синхронизация браузера и обновление при сохранении файлов
    browserSync = require("browser-sync"),
    // Препроцессор html с синтаксисом похожим на emmet и плюшками
    pug = require('gulp-pug'),
    reload = browserSync.reload;


var path = {
    build: { // Папка для собранных файлов
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/',
        vendor: 'build/vendor/'
    },
    src: { // Папка для исходников
        pug: 'src/pug/*.pug', //Синтаксис src/pug/*.pug говорит gulp что мы хотим взять все файлы с расширением .pug в этой папке
        js: 'src/js/main.js', //В стилях и скриптах нам понадобятся только main файлы
        style: 'src/style/main.styl',
        img: 'src/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        fonts: 'src/fonts/**/*.*'
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html: 'src/**/*.pug',
        js: 'src/js/**/*.js',
        style: 'src/style/**/*.styl',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    clean: './build'
};

// Конфигурация Browsersync
var config = {
    server: {
        baseDir: "./build"
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "Gulp + Pug + Stylus"
};




// --------------------------
// ********* Задачи *********


// Копируем вендоров из /node_modules в папку /vendor
gulp.task('vendor:import', function () {

    // Bootstrap
    gulp.src([
            './node_modules/bootstrap/dist/**/*',
            '!./node_modules/bootstrap/dist/css/bootstrap-grid*',
            '!./node_modules/bootstrap/dist/css/bootstrap-reboot*'
        ])
        .pipe(gulp.dest(path.build.vendor + 'bootstrap'))

    // Font Awesome
    gulp.src([
            './node_modules/font-awesome/**/*',
            '!./node_modules/font-awesome/{less,less/*}',
            '!./node_modules/font-awesome/{scss,scss/*}',
            '!./node_modules/font-awesome/.*',
            '!./node_modules/font-awesome/*.{txt,json,md}'
        ])
        .pipe(gulp.dest(path.build.vendor + 'font-awesome'))

    // jQuery
    gulp.src([
            './node_modules/jquery/dist/*',
            '!./node_modules/jquery/dist/core.js'
        ])
        .pipe(gulp.dest(path.build.vendor + 'jquery'))

    // jQuery Easing
    gulp.src([
            './node_modules/jquery.easing/*.js'
        ])
        .pipe(gulp.dest(path.build.vendor + 'jquery-easing'))

    // Masonry.js 
    gulp.src([
            './node_modules/masonry/*.js'
        ])
        .pipe(gulp.dest(path.build.vendor + 'masonry'))

});

// Сборка html
gulp.task('html:build', function () {
    gulp.src(path.src.pug) //Выберем файлы по нужному пути
        // Если нет желания использовать pug можно собирать html из кусочков с помощью fileinclude или rigger
        // .pipe(fileinclude({
        //     prefix: '@@',
        //     basepath: '@file'
        // }))
        .pipe(pug())
        .pipe(gulp.dest(path.build.html)) //Выплюнем их в папку build
        .pipe(reload({
            stream: true
        })); //И перезагрузим наш сервер для обновлений
});

// Сборка js
gulp.task('js:build', function () {
    gulp.src(path.src.js) //Найдем наш main файл
        .pipe(sourcemaps.init()) //Инициализируем sourcemap
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(sourcemaps.write()) //Пропишем карты
        .pipe(uglify()) //Сожмем наш js
        .pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
        .pipe(reload({
            stream: true
        })); //И перезагрузим сервер
});

// Сборка stylus
gulp.task('style:build', function () {
    gulp.src(path.src.style) //Выберем наш main.scss
        .pipe(sourcemaps.init()) //То же самое что и с js
        .pipe(stylus())
        .pipe(prefixer()) //Добавим вендорные префиксы
        .pipe(cssmin()) //Сожмем
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css)) //И в build
        .pipe(reload({
            stream: true
        }));
});

// Сборка картинок
gulp.task('image:build', function () {
    gulp.src(path.src.img) //Выберем наши картинки
        .pipe(imagemin({ //Сожмем их
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }],
            use: [pngquant()],
            verbose: true,
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img)) //И бросим в build
        .pipe(reload({
            stream: true
        }));
});

// Шрифты просто копируем
gulp.task('fonts:build', function () {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

// Общая задача для сборки
gulp.task('build', [
    'vendor:import',
    'html:build',
    'js:build',
    'style:build',
    'fonts:build',
    'image:build'
]);

// Общая задача для отслеживания изменений в файлах
gulp.task('watch', function () {
    watch([path.watch.html], function (event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function (event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function (event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function (event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function (event, cb) {
        gulp.start('fonts:build');
    });
});

// Запускаем  webserver
gulp.task('webserver', function () {
    browserSync(config);
});

// Удаление папки сборки
gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

// Запуск по умолчанию, при команде gulp в консоли, в рабочем каталоге
gulp.task('default', ['build', 'webserver', 'watch']);