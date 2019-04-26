# freeCodeCamp 成都社区 官网后端

[![NPM Dependency](https://david-dm.org/FreeCodeCamp-Chengdu/OWS_BE.svg)](https://david-dm.org/FreeCodeCamp-Chengdu/OWS_BE)

## 技术架构

-   开发模式：**前后端分离**

-   后端技术栈：

    -   [Koa](http://koa.bootcss.com/)

    -   [LeanCloud](https://leancloud.cn/)

## RESTful API

-   `GET` https://fcc-cd.leanapp.cn/activity/
    -   `keywords`：类 Google 搜索字符串
    -   `rows`：分页行数
    -   `page`：页码
    -   `from`：[JS `Date` 兼容格式][1]
    -   `to`：[JS `Date` 兼容格式][1]

[1]: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Date
