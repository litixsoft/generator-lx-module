'use strict';

var path = require('path');
var yeoman = require('yeoman-generator');

function nameIsAvailableOnNpm (name, callback) {
    require('npm-name')(name, function (err, available) {
        if (!available) {
            callback(true);
        }

        callback(false);
    });
}

function nameIsAvailableOnBower (name, callback) {
    require('bower-name')(name, function (err, available) {
        if (!available) {
            callback(true);
        }

        callback(false);
    });
}

module.exports = yeoman.generators.Base.extend({
    initializing: function () {
//        this.pkg = require('../package.json');
        this.log(this.yeoman);
    },

    prompting: {
        promptPackageType: function () {
            var done = this.async();
            var prompts = [
                {
                    type: 'list',
                    message: 'Select the package type',
                    name: 'packageTypes',
                    choices: [
                        'npm',
                        'bower',
                        'both'
                    ],
                    default: 'npm'
                }
            ];

            this.prompt(prompts, function (answers) {
                // save package type
//                this.isNpmPackage = answers.packageTypes.indexOf('npm') > -1;
//                this.isBowerPackage = answers.packageTypes.indexOf('bower') > -1;
                this.isNpmPackage = answers.packageTypes === 'npm' || answers.packageTypes === 'both';
                this.isBowerPackage = answers.packageTypes === 'bower' || answers.packageTypes === 'both';

                done();
            }.bind(this));
        },
        promptingName: function () {
            var self = this;
            var done = this.async();

            var prompts = [
                {
                    name: 'name',
                    message: 'Module Name',
                    default: path.basename(process.cwd())
                },
                {
                    type: 'confirm',
                    name: 'npmPkgName',
                    message: 'The name above already exists on npm, choose another?',
                    default: true,
                    when: function (answers) {
                        var done = this.async();

                        if (self.isNpmPackage) {
                            nameIsAvailableOnNpm(answers.name, done);
                        } else {
                            done();
                        }
                    }
                },
                {
                    type: 'confirm',
                    name: 'bowerPkgName',
                    message: 'The name above already exists on bower, choose another?',
                    default: true,
                    when: function (answers) {
                        var done = this.async();

                        if (self.isBowerPackage) {
                            nameIsAvailableOnBower(answers.name, done);
                        } else {
                            done();
                        }
                    }
                }
            ];

            this.prompt(prompts, function (answers) {
                if (answers.npmPkgName || answers.bowerPkgName) {
                    return this.prompting.promptingName.bind(this)();
                }

                this.slugname = this._.slugify(answers.name);
                this.safeSlugname = this.slugname.replace(
                    /-+([a-zA-Z0-9])/g,
                    function (g) { return g[1].toUpperCase(); }
                );

                done();
            }.bind(this));
        },
        prompting1: function () {
            var self = this;
            var done = this.async();

            var prompts = [
                {
                    name: 'description',
                    message: 'Description',
                    default: 'The best module ever.'
                },
                {
                    name: 'homepage',
                    message: 'Homepage'
                },
                {
                    name: 'license',
                    message: 'License',
                    default: 'MIT'
                },
                {
                    name: 'githubUsername',
                    message: 'GitHub username'
                },
                {
                    name: 'authorName',
                    message: 'Author\'s Name'
                },
                {
                    name: 'authorEmail',
                    message: 'Author\'s Email'
                },
                {
                    name: 'authorUrl',
                    message: 'Author\'s Homepage'
                },
                {
                    name: 'maintainers',
                    message: 'Maintainers (comma to split)'
                },
                {
                    name: 'keywords',
                    message: 'Key your keywords (comma to split)'
                },
                {
                    name: 'useAngular',
                    message: 'Do you use angular?',
                    type: 'confirm',
                    default: true,
                    when: function () {
                        return self.isBowerPackage;
                    }
                },
                {
                    name: 'useKarma',
                    message: 'Do you use karma unit tests?',
                    type: 'confirm',
                    default: true,
                    when: function () {
                        return self.isBowerPackage;
                    }
                }
            ];

            this.currentYear = (new Date()).getFullYear();

            this.prompt(prompts, function (answers) {
                this.props = answers;

                if (answers.githubUsername) {
                    this.repoUrl = 'https://github.com/' + answers.githubUsername + '/' + this.slugname;
                } else {
                    this.repoUrl = 'user/repo';
                }

                if (!answers.homepage) {
                    answers.homepage = this.repoUrl;
                }

                this.keywords = answers.keywords.split(',');
                this.maintainers = answers.maintainers.split(',');

                done();
            }.bind(this));
        }
    },
    configuring: function () {
        this.copy('editorconfig', '.editorconfig');
        this.copy('gitattributes', '.gitattributes');
        this.copy('gitignore', '.gitignore');
        this.copy('jshintrc', '.jshintrc');
        this.copy('CHANGELOG.md', 'CHANGELOG.md');
        this.copy('validate-commit-msg.js', 'validate-commit-msg.js');

        if (this.props.license === 'MIT') {
            this.template('_LICENSE', 'LICENSE');
        }

        if (this.isBowerPackage) {
            this.template('_bower.json', 'bower.json');
            this.template('bowerrc', '.bowerrc');
        }
        if (this.isNpmPackage) {
            this.copy('npmignore', '.npmignore');
        }

        this.template('_travis.yml', '.travis.yml');
        this.template('_Gruntfile.js', 'Gruntfile.js');
        this.template('_package.json', 'package.json');
        this.template('_README.md', 'README.md');
    },

    writing: function () {
        this.mkdir('lib');
        this.template('lib/lib.js', 'lib/' + this.slugname + '.js');
        this.mkdir('test');
        this.template('test/lib.spec.js', 'test/' + this.slugname + '.spec.js');
    },

    install: function () {
//        this.installDependencies({
//            skipInstall: this.options['skip-install']
//        });
    }
});