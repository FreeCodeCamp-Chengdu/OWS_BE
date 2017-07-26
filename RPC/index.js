'use strict';

const  Path = require('path'),  FS = require('fs'),  LC = require('leanengine');

const  RPC_root = Path.dirname( module.filename );


for (let name  of  FS.readdirSync( RPC_root ))
    if (name !== 'index.js')
        require(`./${name}`).call(LC,  Path.parse( name ).name);
