module.exports = function (grunt) {

    var path = require('path'),
        async = require('async'),
        mkdirp = require('mkdirp'),
        _ = require('lodash');

    var fs = require('fs'),
        stat = fs.stat,
        crypto = require('crypto');


    var adminModulePath = path.join(__dirname, '..', 'FocusTaobaoAdmin');

    var topQueue = [];


    console.log(adminModulePath);

    // 配置Grunt各种模块的参数
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            /* jshint的参数 */
            options: {
                force: true
            },
            all: ['Gruntfile.js', 'app/**/*.js', 'util/**/*.js', 'config/**/*.js', 'public/javascripts/**/*.js']
        },
        cssmin: {
            /* cssmin的参数 */
            minify: {
                expand: true,
                src: ['public/stylesheets/**/*.css', '!*.min.css'],
                dest: '',
                ext: '.min.css'
            }
        },
        concat: {
            /* concat的参数 */
            dist: {
                expand: true,
                src: ['public/javascripts/**/*.min.js'],
                dest: '',
                ext: '.concat.js'
            }
        },
        uglify: {
            /* uglify的参数 */
            options: {
                sourceMap: true,
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            minify: {
                expand: true,
                src: ['public/javascripts/**/*.js', '!*.min.js'],
                dest: '',
                ext: '.min.js'
            }
        },
        watch: {
            model: {
                files: ['node_modules/top-models/**']
//                task: ['copy']
            }
        }
//        copy: {
//            files: [
//                {
//                    expand: true,
//                    src: ['node_modules/top-models/**'],
//                    dest: adminModulePath,
//                    filter: 'isFile'
//                }
//            ]
//        }
    });

    // 从node_modules目录加载模块文件
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // 每行registerTask定义一个任务
    grunt.registerTask('default', ['jshint', 'uglify', 'cssmin']);
    grunt.registerTask('check', ['jshint']);

    grunt.event.on('watch', function (action, filepath) {
        var makeFileMD5 = function makeFileMd5(file, cb) {
            if (!fs.existsSync(file)) {
                console.log(file + " not exists");
                return cb(null, '');
            }
            var md5sum = crypto.createHash('md5');

            var s = fs.ReadStream(file);
            s.on('data', function (d) {
                md5sum.update(d);
            });

            s.on('end', function () {
                var md5 = md5sum.digest('hex');
                console.log(md5);
                cb(null, md5);
            });
        };

        var fromPath = path.join(__dirname, filepath),
            toPath = path.join(adminModulePath, filepath);


        async.parallel({
            'from': function (cb) {
                makeFileMD5(fromPath, cb);
            },

            'to': function (cb) {
                makeFileMD5(toPath, cb);
            }
        }, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                if (result.from !== result.to) {
                    var dir = path.dirname(toPath);
                    console.log(dir);
                    if (!fs.existsSync(dir)) {
                        console.log(dir + " not exists");
                        mkdirp.sync(dir);
                    }
                    // 通过管道来传输流
                    fs.createReadStream(fromPath).pipe(fs.createWriteStream(toPath));
                }
            }
        });
    });
};