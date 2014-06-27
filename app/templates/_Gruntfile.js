'use strict';

module.exports = function (grunt) {
    var path = require('path');

    // load npm tasks
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    /**
     * Gets the index.html file from the code coverage folder.
     *
     * @param {!string} folder The path to the code coverage folder.
     */
    function getCoverageReport (folder) {
        var reports = grunt.file.expand(folder + '*/index.html');

        if (reports && reports.length > 0) {
            return reports[0];
        }

        return '';
    }

    // Project configuration.
    grunt.initConfig({
        jshintFiles: ['Gruntfile.js', <% if (isNpmPackage) { %>'lib/**/*.js', 'test/**/*.js'<% } %>],
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            jasmine: ['.reports/test'],
            lint: ['.reports/lint'],
            coverage: ['.reports/coverage'],
            ci: ['.reports']
        },
        jshint: {
            options: {
                jshintrc: true
            },
            test: '<%%= jshintFiles %>',
            jslint: {
                options: {
                    reporter: 'jslint',
                    reporterOutput: '.reports/lint/jshint.xml'
                },
                files: {
                    src: '<%%= jshintFiles %>'
                }
            },
            checkstyle: {
                options: {
                    reporter: 'checkstyle',
                    reporterOutput: '.reports/lint/jshint_checkstyle.xml'
                },
                files: {
                    src: '<%%= jshintFiles %>'
                }
            }
        },
        bgShell: {
            coverage: {
                cmd: 'node node_modules/istanbul/lib/cli.js cover --dir .reports/coverage node_modules/grunt-jasmine-node/node_modules/jasmine-node/bin/jasmine-node -- test --forceexit'
            },
            cobertura: {
                cmd: 'node node_modules/istanbul/lib/cli.js report --root .reports/coverage --dir .reports/coverage cobertura'
            }
        },
        open: {
            coverage: {
                path: function () {
                    return path.join(__dirname, getCoverageReport('.reports/coverage/'));
                }
            }
        },<% if (props.useKarma) { %>
        karma: {
            unit: {
                configFile: 'test/karma.conf.js'
            },
            ci: {
                configFile: 'test/karma.conf.js',
                colors: false,
                reporters: ['mocha', 'junit'],
                junitReporter: {
                    outputFile: '.reports/tests/<%= slugname %>.xml',
                    suite: '<%= slugname %>'
                }
            },
            debug: {
                configFile: 'test/karma.conf.js',
                singleRun: false,
                detectBrowsers: {
                    enabled: false
                }
            },
            coverage: {
                configFile: 'test/karma.coverage.conf.js',
                colors: false
            },
            cobertura: {
                configFile: 'test/karma.coverage.conf.js',
                colors: false,
                coverageReporter: {
                    type: 'cobertura',
                    dir: '.reports/coverage'
                }
            }
        },<% } %>
        jasmine_node: {
            options: {
                specNameMatcher: './*.spec', // load only specs containing specNameMatcher
                requirejs: false,
                forceExit: true
            },
            test: ['test/'],
            ci: {
                options: {
                    jUnit: {
                    report: true,
                    savePath: '.reports/test/',
                    useDotNotation: true,
                    consolidate: true
                    }
                },
                src: ['test/']
            }
        },
        changelog: {
            options: {
            }
        },
        bump: {
            options: {
                files: ['package.json' <% if (isBowerPackage) { %>, 'bower.json'<% } %>],
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
        require('fs').chmodSync('.git/hooks/commit-msg', '0755');
        grunt.log.ok('Registered git hook: commit-msg');
    });

    grunt.registerTask('lint', ['jshint:test']);
    grunt.registerTask('test', ['git:commitHook', 'clean:jasmine', 'jshint:test',<% if (props.useKarma) { %> 'karma:unit' <% } else { %> 'jasmine_node:test'<% } %>]);
    grunt.registerTask('cover', ['clean:coverage', 'jshint:test', <% if (props.useKarma) { %> 'karma:coverage' <% } else { %> 'bgShell:coverage'<% } %>, 'open:coverage']);
    grunt.registerTask('ci', ['clean:ci', 'jshint:jslint', 'jshint:checkstyle',<% if (props.useKarma) { %> 'karma:ci', 'karma:coverage', 'karma:cobertura' <% } else { %> 'jasmine_node:ci', 'bgShell:coverage', 'bgShell:cobertura'<% } %>]);
    grunt.registerTask('release', 'Bump version, update changelog and tag version', function (version) {
        grunt.task.run([
            'bump:' + (version || 'patch') + ':bump-only',
            'changelog',
            'bump-commit'
        ]);
    });

    // Default task.
    grunt.registerTask('default', ['test']);
};