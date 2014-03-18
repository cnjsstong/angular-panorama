/* global require, module, process */

'use strict';

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        meta: {
            banner: '/**\n' +
                ' * <%= pkg.description %>\n' +
                ' * @version v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
                ' * @link <%= pkg.homepage %>\n' +
                ' * @author <%= pkg.author %>\n' +
                ' * @license MIT License, http://www.opensource.org/licenses/MIT\n' +
                ' */\n'
        },
        connect: {
            devserver: {
                options: {
                    port: 9999,
                    hostname: '0.0.0.0',
                    base: '.',
                    keepalive: true
                }
            }
        },
        dirs: {
            dest: '.'
        },

        // Copies remaining files to places other tasks can use
        copy: {
            styles: {
                dest: '<%= dirs.dest %>/<%= pkg.name %>.css',
                src: 'src/**/*.css'
            }
        },
        concat: {
            options: {
                banner: '<%= meta.banner %>'
            },
            dist: {
                src: ['src/*.js', 'src/**/*.js'],
                dest: '<%= dirs.dest %>/<%= pkg.name %>.js'
            }
        },
        cssmin: {
            combine: {
                files: {
                    '<%= dirs.dest %>/<%= pkg.name %>.min.css': ['src/css/*.css']
                }
            }
        },
        uglify: {
            options: {
                banner: '<%= meta.banner %>'
            },
            dist: {
                src: ['<%= concat.dist.dest %>'],
                dest: '<%= dirs.dest %>/<%= pkg.name %>.min.js'
            }
        },
        jshint: {
            files: ['Gruntfile.js', 'src/**/*.js'],
            options: {
                curly: false,
                browser: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                expr: true,
                node: true,
                globals: {
                    exports: true,
                    angular: false,
                    $: false
                }
            }
        },
        watch: {
            files: ['src/**'],
            tasks: ['build']
        }
    });
//
//    // Load the plugin that provides the "jshint" task.
//    grunt.loadNpmTasks('grunt-contrib-jshint');
//
//    // Load the plugin that provides the "concat" task.
//    grunt.loadNpmTasks('grunt-contrib-concat');
//
//    // Load the plugin that provides the "uglify" task.
//    grunt.loadNpmTasks('grunt-contrib-uglify');
//
//    grunt.loadNpmTasks('grunt-contrib-cssmin');
//
//    grunt.loadNpmTasks('grunt-contrib-connect');
//
//    // Load the plugin that provides the "watch" task.
//    grunt.loadNpmTasks('grunt-contrib-watch');

    // Build task.
    grunt.registerTask('build', ['copy:styles', 'concat', 'uglify', 'cssmin']);

};
