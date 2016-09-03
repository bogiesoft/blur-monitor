/*jslint node: true */

'use strict';

var assets = require('../services/assets');

module.exports = getRoutes();

function getRoutes() {
    var routes = [];

    routes.push({
        method: 'GET',
        path: '/api/assets/distros',
        handler: function (request, reply) {
            return reply(assets.getAssets('distros'));
        }
    });

    return routes;
}
