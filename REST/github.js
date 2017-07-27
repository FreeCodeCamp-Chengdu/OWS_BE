'use strict';

const router = require('express').Router(),
      Request = require('request-promise-native');


router.all('*',  function (request, response, next) {

    if (! request.user) {

        const error = new Error('Unauthorized');

        error.status = 401;

        return  next( error );
    }

    Request({
        method:     request.method,
        uri:        `https://api.github.com${
            request.originalUrl.slice( request.baseUrl.length )
        }`,
        headers:    {
            'User-Agent':     'LeanCloud client',
            Authorization:    `token ${request.user.token}`
        },
        json:       (! request.body)  ||  request.body
    }).then(function () {

        response.json( arguments[0] );
    });
});


module.exports = router;