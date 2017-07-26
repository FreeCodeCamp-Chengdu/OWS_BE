'use strict';

const  bodyParser = require('body-parser'),  AV = require('leanengine');

// 加载云函数定义，你可以将云函数拆分到多个文件方便管理，但需要在主文件中加载它们
require('./RPC');


var app = require('express')();

// 设置默认超时时间
app.use( require('connect-timeout')('15s') );

// 加载云引擎中间件
app.use( AV.express() );

app.enable('trust proxy');

app.use( AV.Cloud.HttpsRedirect() );

app.use( bodyParser.json() );

app.use( bodyParser.urlencoded({ extended: false }) );

app.use( require('cookie-parser')() );



app.get('/', function(request, response) {

    response.send('Hello, Express & LeanCloud !');
});


app.use(function(request, response, next) {

    // 如果任何一个路由都没有返回响应，则抛出一个 404 异常给后续的异常处理器

    if ( response.headersSent )  return;

    var error = new Error('Not Found');

    error.status = 404;

    next( error );
});


//  异常处理
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
