'use strict';

var fs = require('fs');

module.exports = function (grunt) {
    // load npm tasks
    require('load-grunt-tasks')(grunt);

    // Project configuration.
    grunt.initConfig({
        jshintFiles: ['Gruntfile.js', 'app/index.js'],
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            reports: ['.reports'],
            demo: ['demo']
        },
        eslint: {
            all: '<%= jshintFiles %>',
            jslint: {
                options: {
                    reporter: 'jslint',
                    reporterOutput: '.reports/lint/eslint.xml'
                },
                files: {
                    src: '<%= jshintFiles %>'
                }
            },
            checkstyle: {
                options: {
                    reporter: 'checkstyle',
                    reporterOutput: '.reports/lint/eslint_checkstyle.xml'
                },
                files: {
                    src: '<%= jshintFiles %>'
                }
            }
        },
        bgShell: {
            generator: {
                cmd: 'cd demo && yo lx-module'
            },
            check_for_updates: {
                cmd: 'cd demo && node ../node_modules/npm-check-updates/bin/npm-check-updates'
            },
            run_tests: {
                cmd: 'cd demo && grunt test --force && grunt ci --force'
            },
            link: {
                cmd: 'npm link'
            },
            sudo_link: {
                cmd: 'sudo npm link'
            }
        },
        changelog: {
            options: {
            }
        },
        bump: {
            options: {
                files: ['package.json'],
                updateConfigs: ['pkg'],
                commitFiles: ['.'],
                commitMessage: 'chore: release v%VERSION%',
                push: false
            }
        }
    });

    // Register tasks.
    grunt.registerTask('git:commitHook', 'Install git commit hook', function () {
        grunt.file.copy('validate-commit-msg.js', '.git/hooks/commit-msg');
        fs.chmodSync('.git/hooks/commit-msg', '0755');
        grunt.log.ok('Registered git hook: commit-msg');
    });

    grunt.registerTask('mkdir:demo', 'Create test directory', function () {
        grunt.file.mkdir(require('path').join(__dirname, 'demo'));
    });

    grunt.registerTask('link', 'Do npm link to test the generator', function () {
        if (process.platform === 'win32') {
            grunt.task.run(['bgShell:link']);
        } else {
            grunt.task.run(['bgShell:sudo_link']);
        }
    });

    grunt.registerTask('test', 'Test the generator', function () {
        grunt.task.run(['git:commitHook', 'eslint:all', 'clean:demo', 'mkdir:demo', 'link', 'bgShell:generator', 'bgShell:check_for_updates', 'bgShell:run_tests']);
    });

    grunt.registerTask('lint', ['eslint:all']);
    grunt.registerTask('ci', ['clean', 'eslint:jslint', 'eslint:checkstyle']);
    grunt.registerTask('release', 'Bump version, update changelog and tag version', function (version) {
        grunt.task.run([
                'bump:' + (version || 'patch') + ':bump-only',
            'changelog',
            'bump-commit'
        ]);
    });

    // Default task.
    grunt.registerTask('default', 'lint');
};
