'use strict';
var _ = require('lodash');
var es = require('event-stream');
var gutil = require('gulp-util');
var File = gutil.File;
var jScrambler = require('jscrambler');
var path = require('path');

module.exports = function (options) {
  var files = {};
  var filesSrc = [];
  var projectId;
  options = _.defaults(options || {}, {
    keys: {
      accessKey: '',
      secretKey: ''
    },
    deleteProject: false,
    params: {
      rename_local: '%DEFAULT%',
      whitespace: '%DEFAULT%',
      literal_hooking: '%DEFAULT%',
      dead_code: '%DEFAULT%',
      dot_notation_elimination: '%DEFAULT%',
      dead_code_elimination: '%DEFAULT%',
      constant_folding: '%DEFAULT%',
      literal_duplicates: '%DEFAULT%',
      function_outlining: '%DEFAULT%',
      string_splitting:'%DEFAULT%'
    }
  });
	var aggregate = function (file) {
    if (file.contents) {
      filesSrc.push(file);
      files[path.relative(process.cwd(), file.path)] = file;
    }
  };
  var scramble = function () {
    var self = this;
    var client = new jScrambler.Client({
      accessKey: options.keys.accessKey,
      secretKey: options.keys.secretKey,
      host: options.host,
      port: options.port,
      apiVersion: options.apiVersion
    });
    jScrambler
      .uploadCode(client, _.merge(options.params, {
        files: filesSrc
      }))
      .then(function (res) {
        projectId = res.id;
        return jScrambler.downloadCode(client, res.id);
      })
      .then(function (res) {
        return jScrambler.unzipProject(res, function (buffer, file) {
          var relativePath = path.relative(process.cwd(), file);
          self.emit('data', new File({
            path: relativePath,
            contents: buffer
          }));
        })
      })
      .then(function () {
        if (options.deleteProject) {
          return jScrambler.deleteCode(client, projectId);
        }
      })
      .done(function () {
        self.emit('end');
      });
	};
	return es.through(aggregate, scramble);
};