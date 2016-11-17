const EventEmitter = require('events');

const _ = require('lodash');
const async = require('async');
const mysql = require('mysql');
const restify = require('restify');
const Sequelize = require('sequelize');
const Router = require('./router');
const errors = require('./errors');
const logger = require('./logger');
const model = require('./model');

/**
 * Expose new instance of `Application`
 *
 */
module.exports = class Application extends EventEmitter {

  constructor() {
    super();

    // Remove memory-leak warning about max listeners
    this.setMaxListeners(0);

    // Expose `restify`
    this.restify = restify;

    // Expose `Sequelize`
    this.Sequelize = Sequelize;

    // Expose `mysql`
    this.mysql = mysql;

    // Expose `application instance`
    this.app = restify.createServer();

    // Expose every middleware inside `strapi.middlewares`
    this.middlewares = [];

    // Expose `Router`
    this.Router = Router;

    // Expose `Error`
    this.errors = errors;

    this.model = model;

    // New Winston logger
    this.log = logger;
  }

  /*
   * Method to load instance
   *
   * @api private
   */
  load(config, cb) {
    require('./load').apply(this, [config, cb]);
  }

  /*
   * Method to initialize instance
   *
   * @api private
   */
  initialize(cb) {
    require('./initialize').apply(this, [cb]);
  }

  /**
   * Method to start instance
   *
   * @api public
   */
  start(callback) {
    // Callback is optional.
    callback = callback || function (err) {
      if (err) {
        return this.log.error(err);
      }
    };

    const scope = {
      rootPath: process.cwd(),
    };

    async.series([
      cb => this.load(scope, cb),
      cb => this.initialize(cb),
    ], (err) => {
      if (err) {
        this.log.error('Failed start the application.', err);
        return this.stop();
      }

      // Emit an event when Restapi has started.
      this.started = true;
      this.emit('started');
      return callback(null, this);
    });
  }

  /**
   * The inverse of `start()`, this method
   * shuts down all attached servers.
   *
   * It also unbinds listeners and terminates child processes.
   *
   * @api public
   */
  stop() {
    // Flag `this._exiting` as soon as the application has begun to shutdown.
    // This may be used by hooks and other parts of core.
    this._exiting = true;

    // Emit a `stop` event.
    this.emit('stop');

    // Exit the REPL.
    process.exit(0);
  }

  /**
   * Expose certain global variables.
   *
   * @api private
   */
  exposeGlobals(cb) {
    global.restapi = this;

    // Globals explicitly disabled.
    if (this.config.globals === false) {
      return cb();
    }

    // Expose globals as an empty object.
    this.config.globals = this.config.globals || {};

    // Expose Lodash globally if enabled.
    if (this.config.globals._ !== false) {
      global._ = _;
    }

    // Expose Async globally if enabled.
    if (this.config.globals.async !== false) {
      global.async = async;
    }

    return cb();
  }
};
