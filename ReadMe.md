# FCC 成都社区 - 官网后端

基于 [Koa][1]、[TypeScript][2] 和 [LeanCloud][3] 的 RESTful API

[![NPM Dependency](https://david-dm.org/FreeCodeCamp-Chengdu/OWS_BE.svg)][4]
[![Build Status](https://travis-ci.com/FreeCodeCamp-Chengdu/OWS_BE.svg?branch=v2)][5]

## 本地开发

```shell
npm install
lean up
```

## 电邮钩子

LeanCloud 貌似没开放 POP3、IMAP 协议的端口，只能在本地监听 [MikeCRM][6] 等**表单服务商**的新数据邮件。

[1]: https://koajs.com/
[2]: https://www.typescriptlang.org/
[3]: https://leancloud.cn/
[4]: https://david-dm.org/FreeCodeCamp-Chengdu/OWS_BE
[5]: https://travis-ci.com/FreeCodeCamp-Chengdu/OWS_BE
[6]: source/controller/MikeCRM.ts
