'use strict';

var fs = require('fs');
var jScrambler = require('../../');
var keys = require('../../jscrambler_keys');
var gulp = require('gulp');

describe('JScrambler Gulp Task', function () {

  it('obfuscates a single file', function (done) {
    gulp
      .src('./index.js')
      .pipe(jScrambler({
        keys: keys,
        deleteProject: true
      }))
      .pipe(gulp.dest('./results/single'))
      .on('end', function () {
        fs.exists('./results/single/index.js', function (exists) {
          if (exists) {
            done();
          } else {
            done(new Error('File not found'));
          }
        });
      });
  });

});
