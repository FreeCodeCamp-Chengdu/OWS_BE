'use strict';

const  bodyParser = require('body-parser'),  Passport = require('passport'),
       LC = require('leanengine');

// 加载云函数定义，你可以将云函数拆分到多个文件方便管理，但需要在主文件中加载它们
require('./RPC');



/* ---------- Express 中间件 ---------- */

var app = require('express')();

//  LeanCloud 云引擎中间件

app.use( require('connect-timeout')('15s') );

app.use( LC.express() );

app.enable('trust proxy');

app.use( LC.Cloud.HttpsRedirect() );

//  HTTP 基础中间件

app.use( require('cookie-parser')() );

app.use( bodyParser.json() );

app.use( bodyParser.urlencoded({ extended: false }) );

//  Session / Passport 中间件

app.use(require('express-session')({
    secret:               process.env.GITHUB_APP_SECRET,
    resave:               false,
    saveUninitialized:    false
}));

app.use( Passport.initialize() );

app.use( Passport.session() );

Passport.serializeUser(function (user, done) {

    done(null, user);
});

Passport.deserializeUser(function (user, done) {

    done(null, user);
});


/* ---------- RESTful API 路由 ---------- */

app.get('/', function(request, response) {

    response.send('Hello, Express & LeanCloud !');
});


app.use( require('./REST/auth') );



/* ---------- 异常处理 ---------- */

app.use(function(request, response, next) {

    // 如果任何一个路由都没有返回响应，则抛出一个 404 异常给后续的异常处理器

    if ( response.headersSent )  return;

    var error = new Error('Not Found');

    error.status = 404;

    next( error );
});


app.use(function(error, request, response) {

    // 忽略 websocket 的超时
    if (request.timedout  &&  (request.headers.upgrade === 'websocket'))
        return;

    var statusCode = error.status || 500;

    if (statusCode === 500)  console.error(error.stack || error);

    if ( request.timedout )
        console.error(
            `请求超时: url=${request.originalUrl}, timeout=${error.timeout}, 请确认方法执行耗时很长，或没有正确的 response 回调。`
        );

    response.status( statusCode );

    //  若非开发环境，须隐藏 异常堆栈信息
    error = Object.assign({ }, error);

    if (app.get('env') !== 'development')  delete error.stack;

    response.json( error );
});


module.exports = app;
