'use strict';

var sut = require('../lib/<%= slugname %>.js');

beforeEach(function () {

});

describe('<%= slugname %>', function () {
    it('should export awesome', function () {
        expect(sut.awesome).toBeDefined();
    });
});
