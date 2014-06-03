module.exports = function(grunt) {

    // 配置Grunt各种模块的参数
    grunt.initConfig({
        jshint: { /* jshint的参数 */ },
        concat: { /* concat的参数 */ },
        uglify: { /* uglify的参数 */ },
        watch:  { /* watch的参数 */ }
    });

    // 从node_modules目录加载模块文件
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // 每行registerTask定义一个任务
    grunt.registerTask('default', ['jshint', 'concat', 'uglify']);
    grunt.registerTask('check', ['jshint']);

};