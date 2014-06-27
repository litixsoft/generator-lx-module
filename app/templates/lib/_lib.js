/*
 * <%= name %>
 * <%= props.homepage %>
 *
 * Copyright (c) <%= currentYear %> <%= props.authorName %><% if (isNpmPackage) { %>
 * Licensed under the <%= props.license %> license.<% } %>
 */

<% if (isBowerPackage && isNpmPackage) { %>
(function (exports) {
    'use strict';

    exports.awesome = function() {
        return 'awesome';
    };
})(typeof(module) !== undefined && module.exports !== undefined ? module.exports : (window.<%= safeSlugname %> = window.<%= safeSlugname %> || {}));<% } else { %>
'use strict';

module.exports.awesome = function() {
    return 'awesome';
};<% } %>