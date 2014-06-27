/*
 * <%= props.name %>
 * <%= props.homepage %>
 *
 * Copyright (c) <%= currentYear %> <%= props.authorName %><% if (isNpmPackage) { %>
 * Licensed under the <%= props.license %> license.<% } %>
 */

'use strict';

module.exports.awesome = function() {
    return 'awesome';
};