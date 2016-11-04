const _ = require('lodash');
const OpenRest = require('open-rest');
const errors = require('./errors');
const helper = require('./helper');

// Expose inner object from OpenRest
const { Router, defaultCtl, model, utils, restify, Sequelize, mysql } = OpenRest;

// #
// Create an OpenRest application
//
// @param  {Object} options
// @return {Object} Server
// #
const createServer = (opts) => {
  // 创建web服务
  const service = opts.config.service || 'open-rest';
  const server = restify.createServer({
    name: service.name,
    version: service.version,
  });

  // 设置中间件
  server.use(restify.acceptParser(server.acceptable));
  server.use(restify.queryParser(opts.config.queryParser || null));
  server.use(restify.bodyParser(opts.config.bodyParser || null));
  server.use((req, res, next) => {
    // 初始化 hooks
    req.hooks = {};
    // 强制处理字符集
    res.charSet(opts.config.charset || 'utf-8');
    return next();
  });

  // 自定义中间件
  // 需要自定义一些中间件，请写在这里
  const middleWares = require(opts.middleWarePath);
  if (!_.isArray(middleWares)) { return; }
  _.each(middleWares, middleWare =>
    server.use((req, res, next) => {
      try {
        return middleWare(req, res, next);
      } catch (error) {
        console.error(new Date());
        console.error(req.url);
        console.error(error);
        console.error(error.stack);
        return next(error);
      }
    })

  );

  // 路由初始化、控制器载入
  require(opts.routePath)(new Router(
    server,
    utils.getModules(opts.controllerPath),
    defaultCtl,
    opts.config.route
  )
  );

  // 监听错误，打印出来，方便调试
  server.on('uncaughtException', (req, res, route, error) => {
    console.error(new Date());
    console.error(route);
    console.error(error);
    console.error(error.stack);
    if (!res.finished) {
      return res.send(500, 'Internal error');
    }
  });
  // 返回server
  return server;
};

// Expose `createServer()`
exports = module.exports = createServer;

// Expose prototypes
exports.Router = Router;
exports.helper = helper;
exports.defaultCtl = defaultCtl;
exports.model = model;
exports.utils = utils;
exports.errors = errors;

// Expose dependencies package
exports.restify = restify;
exports.Sequelize = Sequelize;
exports.mysql = mysql;
