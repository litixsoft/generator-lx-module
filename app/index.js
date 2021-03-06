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
                    default: 'both'
                }
            ];

            this.prompt(prompts, function (answers) {
                // save package type
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
                        var done2 = this.async();

                        if (self.isNpmPackage) {
                            nameIsAvailableOnNpm(answers.name, done2);
                        } else {
                            done2();
                        }
                    }
                },
                {
                    type: 'confirm',
                    name: 'bowerPkgName',
                    message: 'The name above already exists on bower, choose another?',
                    default: true,
                    when: function (answers) {
                        var done2 = this.async();

                        if (self.isBowerPackage) {
                            nameIsAvailableOnBower(answers.name, done2);
                        } else {
                            done2();
                        }
                    }
                }
            ];

            this.prompt(prompts, function (answers) {
                if (answers.npmPkgName || answers.bowerPkgName) {
                    return this.prompting.promptingName.bind(this)();
                }

                this.name = answers.name;
                this.slugname = this._.slugify(answers.name);
                this.safeSlugname = this.slugname.replace(
                    /-+([a-zA-Z0-9])/g,
                    function (g) {
                        return g[1].toUpperCase();
                    }
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
                    message: 'Do you use AngularJS?',
                    type: 'confirm',
                    default: true,
                    when: function () {
                        return self.isBowerPackage && !self.isNpmPackage;
                    }
                },
                {
                    name: 'useKarma',
                    message: 'Do you use Karma test runner?',
                    type: 'confirm',
                    default: true,
                    when: function () {
                        return self.isBowerPackage && !self.isNpmPackage;
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

                this.keywords = (answers.keywords || '').split(',').map(function (item) {
                    return item.trim();
                });

                this.maintainers = (answers.maintainers || '').split(',').map(function (item) {
                    return item.trim();
                });

                done();
            }.bind(this));
        }
    },

    configuring: function () {
        this.copy('editorconfig', '.editorconfig');
        this.copy('gitattributes', '.gitattributes');
        this.copy('gitignore', '.gitignore');
        this.copy('eslintrc', '.eslintrc');
        this.copy('CHANGELOG.md', 'CHANGELOG.md');
        this.copy('_validate-commit-msg.js', 'validate-commit-msg.js');

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
        if (this.isBowerPackage && !this.isNpmPackage) {
            this.mkdir('src');
            this.template('lib/_bower.lib.js', 'src/' + this.slugname + '.js');
        } else {
            this.mkdir('lib');
            this.template('lib/_lib.js', 'lib/' + this.slugname + '.js');
        }

        this.mkdir('test');

        if (this.props.useKarma) {
            this.template('test/_karma.conf.js', 'test/karma.conf.js');
            this.template('test/_karma.coverage.conf.js', 'test/karma.coverage.conf.js');
            this.template('test/_karma.webstorm.conf.js', 'test/karma.webstorm.conf.js');
            this.template('test/_karma.spec.js', 'test/' + this.slugname + '.spec.js');
        } else if (this.isNpmPackage) {
            this.template('test/_lib.spec.js', 'test/' + this.slugname + '.spec.js');
        }
    },

    install: function () {
        this.installDependencies({
            skipInstall: this.options['skip-install']
        });
    }
});
