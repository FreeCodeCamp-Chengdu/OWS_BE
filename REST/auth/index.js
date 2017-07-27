'use strict';

const  router = require('express').Router(),
       subModule = require('../../utility/subModule');


router.get('/session',  function (request, response) {

    response.json( request.user );
});


subModule(module,  function (module, info) {

    router.use(`/auth/${info.name}`, module);
});


module.exports = router;