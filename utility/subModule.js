'use strict';

const  Path = require('path'),  FS = require('fs'),
       Module_Type = ['.js', '.json', ''];



module.exports = function (module, forEach) {

    const Module_root = (typeof module === 'string')  ?
              Path.join(process.cwd(), module)  :  Path.dirname( module.filename ),
          sub = [ ];

    forEach = (typeof forEach === 'function')  &&  forEach;


    for (let name  of  FS.readdirSync( Module_root )) {

        name = Path.parse( name );

        if ((name.base !== 'index.js')  &&  Module_Type.includes( name.ext )) {

            let _this_ = require( Path.join(Module_root, name.base) );

            sub.push(_this_);

            forEach  &&  forEach.call(this, _this_, name);
        }
    }

    return sub;
};