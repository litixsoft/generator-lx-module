'use strict';

describe('<%= slugname %>', function () {<% if (props.useAngular) { %>
    var service;

    beforeEach(function () {
        module('<%= slugname %>');

        inject(function ($injector) {
            service = $injector.get('$<%= safeSlugname %>');
        });
    });

    describe('$<%= safeSlugname %>', function() {
        it('should be initialized correctly ', function () {
            expect(typeof service).toBe('object');
        });
    });<% } else { %>
    it('should be initialized correctly ', function () {
        expect(typeof window.<%= safeSlugname %>).toBe('object');
    });<% } %>
});