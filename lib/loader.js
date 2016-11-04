const _ = require('lodash');
const OpenRest = require('./open-rest');


// Expose inner object from OpenRest
const { Router, helper, defaultCtl, model, utils, errors, restify, Sequelize, mysql } = OpenRest;

// Loader initialize
const loader = { Router, helper, defaultCtl, model, utils, errors, restify, Sequelize, mysql };
loader.ENV = process.env.NODE_ENV || 'development';

/**
 * Set initialize directory structure
 * @param  {String} rootPath [description]
 * @return {Object}          [description]
 */
const initOpts = rootPath =>
  ({
    configPath: `${rootPath}/app/configs`,
    controllerPath: `${rootPath}/app/controllers`,
    helperPath: `${rootPath}/app/controllers/helper`,
    middleWarePath: `${rootPath}/app/middlewares`,
    modelPath: `${rootPath}/app/models`,
    routePath: `${rootPath}/app/routes`,
    utilPath: `${rootPath}/app/lib/utils`,
    errorPath: `${rootPath}/app/lib/errors`,
  })
;

/**
 * Bootstrap Application
 * @param  {String} rootPath [description]
 * @return {Object}          [description]
 */
loader.bootstrap = (rootPath) => {
  let opts;
  let config;
  loader.opts = opts = initOpts(rootPath);
  loader.config = loader.opts.config = config = require(opts.configPath);
  loader.utils = _.extend({}, utils, require(opts.utilPath));
  loader.errors = _.extend({}, errors, require(opts.errorPath));
  loader.model.init(config.db, opts.modelPath);
  loader.helper = _.extend({}, helper, utils.getModules(opts.helperPath));
  loader.server = OpenRest(opts);
  return loader;
};

/**
 * Load module
 * @param  {String} name
 * @param  {Mixed}  module object
 * @return {Object} loader
 */
loader.load = (name, module) => loader[name] = module;

/**
 * Run service
 * @return {Object} loader server
 */
loader.runServe = () => {
  const { service } = loader.config;
  return loader.server.listen(service.port || 8080, service.ip, () => console.log('%s listening at %s', loader.server.name, loader.server.url)
  );
};

// Expose loader
module.exports = loader;
