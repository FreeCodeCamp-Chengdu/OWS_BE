'use strict';

const  Passport = require('passport'),  LC = require('leanengine');

const  GitHub = require('passport-github2').Strategy,
       router = require('express').Router();



Passport.use(new GitHub(
    {
        clientID:        process.env.GITHUB_APP_ID,
        clientSecret:    process.env.GITHUB_APP_SECRET
    },
    function(accessToken, refreshToken, profile, done) {

        var user = {
                token:    accessToken,
                logo:     profile._json.avatar_url,
                blog:     profile._json.blog
            };

        for (var key in profile)
            if (key[0] !== '_')
                user[ key ] = profile[ key ];

        done(null, user);
    }
));


router.get(
    '/',
    Passport.authenticate('github', {
        scope:    ['user:follow', 'public_repo']
    })
);

router.get(
    '/callback',
    Passport.authenticate('github', {
        successRedirect:    '/',
        failureRedirect:    '/'
    })
);


module.exports = router;