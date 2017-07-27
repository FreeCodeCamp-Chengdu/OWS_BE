'use strict';

const  Request = require('request-promise-native');


module.exports = function (request) {

    return Request({
        uri:        `https://api.github.com/${request.params.URI}`,
        headers:    {
            'User-Agent':     'LeanCloud client',
            Authorization:    `token ${process.env.GITHUB_TOKEN}`
        },
        json:    true
    });
};