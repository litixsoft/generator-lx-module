/*
 * <%= name %>
 * <%= props.homepage %>
 *
 * Copyright (c) <%= currentYear %> <%= props.authorName %><% if (isNpmPackage) { %>
 * Licensed under the <%= props.license %> license.<% } %>
 */
<% if (props.useAngular) { %>
'use strict';

angular.module('<%= slugname %>', [])
    .factory('$<%= safeSlugname %>', function() {
        return {};
    });<% } else { %>
(function (window) {
    'use strict';

    window.<%= safeSlugname %> = {};
})(window);<% } %>