var fs = require('fs')
  , server
  , exec = require('child_process').exec
  , environments = {
      local: {
        'wwwPort': '8000',
        'builtwithPort' : '8001',
        'docsPort': '8002',
        'codePort': '8003',
        'dashboardPort': '8004',
        'errorsPort': '8005',
        'wwwServer': 'localhost',
        'builtwithServer': 'localhost',
        'docsServer': 'localhost',
        'codeServer': 'localhost',
        'dashboardServer': 'localhost',
        'errorsServer': 'localhost',
        'errorDocsPath': 'http://localhost:8002'
      },
      dev: {
        wwwPort: '80',
        builtwithPort : '80',
        docsPort: '80',
        codePort: '80',
        dashboardPort: '80',
        errorsPort: '80',
        wwwServer: 'dev.angularjs.org',
        builtwithServer: 'dev.builtwith.angularjs.org',
        docsServer: 'dev.docs.angularjs.org',
        codeServer: 'dev.code.angularjs.org',
        dashboardServer: 'dev.dashboard.angularjs.org',
        errorsServer: 'dev.errors.angularjs.org',
        errorDocsPath: 'http://docs.angularjs.org'
      },
      prod: {
        wwwPort: '80',
        builtwithPort : '80',
        docsPort: '80',
        codePort: '80',
        dashboardPort: '80',
        errorsPort: '80',
        wwwServer: 'angularjs.org',
        builtwithServer: 'builtwith.angularjs.org',
        docsServer: 'docs.angularjs.org',
        codeServer: 'code.angularjs.org',
        dashboardServer: 'dashboard.angularjs.org',
        errorsServer: 'errors.angularjs.org',
        errorDocsPath: 'http://docs.angularjs.org'
      }
    };

module.exports = function (grunt) {
  var env = environments[grunt.option('target')] || environments.local;

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    chmod: {
      options: {
        mode: '777',
      },
      snapshot: {
        src: process.env.USER === 'root' ? ['sites/code.angularjs.org/snapshot', 'sites/code.angularjs.org', 'sites/dashboard.angularjs.org/gitFetchSite.php'] : []
      }
    },
    replace: {
      dist: {
        options: {
          variables: grunt.util._.extend(env, {
            user: process.env.USER,
            pwd: process.cwd()
          }),
          prefix: '@@'
        },
        files: [{
          flatten: true, expand: true, src: [
            'server/sample/nginx.conf',
            'server/sample/builtwith.conf',
            'server/sample/code.conf',
            'server/sample/dashboard.conf',
            'server/sample/docs.conf',
            'server/sample/www.conf',
            'server/sample/fastcgi.conf',
            'server/sample/errors.conf',
            'server/sample/env-config.json'
          ], dest: 'server/config/'
        }]
      }
    },
    ht2j: {
      paths: [{
        output: 'server/config/angularjs.org.htaccess.json',
        input: 'sites/angularjs.org/.htaccess'
      },
      {
        output: 'server/config/code.angularjs.org.htaccess.json',
        input: 'sites/code.angularjs.org/.htaccess'
      },
      {
        output: 'server/config/builtwith.angularjs.org.htaccess.json',
        input: 'sites/builtwith.angularjs.org/.htaccess'
      },
      {
        output: 'server/config/dashboard.angularjs.org.htaccess.json',
        input: 'sites/dashboard.angularjs.org/.htaccess'
      }]
    }
  });

  grunt.registerTask('make-snapshot', function () {
    grunt.file.mkdir('sites/code.angularjs.org/snapshot');
  });

  grunt.registerTask('install-selenium', function () {
    var path = require('path').resolve(process.cwd(),
               'node_modules/protractor/bin/install_selenium_standalone');

    grunt.log.writeln('Installing selenium webdriver standalone and chromedriver');
    exec(path, this.async());
  });

  grunt.registerTask('test', function () {
    var path = require('path').resolve(process.cwd(),
               'node_modules/.bin/protractor');

    grunt.log.writeln('Running protractor...');
    exec(path +' protractorConf.js', this.async());
  });

  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-chmod');
  grunt.loadTasks('./lib/grunt-contrib-htaccess-to-json');
  grunt.loadTasks('./lib/grunt-server');

  grunt.registerTask('configure', ['replace', 'make-snapshot', 'chmod']);
  grunt.registerTask('start', ['nginx:start']);
  grunt.registerTask('stop', ['nginx:stop']);
  grunt.registerTask('reload', ['nginx:restart']);
};
