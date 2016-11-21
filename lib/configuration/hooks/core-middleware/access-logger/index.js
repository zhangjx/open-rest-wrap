const morgan = require('morgan');
const moment = require('moment');

// morgan.token('remote-addr', req => [req._clientIp, req._realIp, req._remoteIp].join(' - '));
morgan.token('date', () => moment().format('YYYY-MM-DD HH:mm:ss:SSS'));
// morgan.token('req-body', (req, res) => JSON.stringify(req.body));
const logFormat = [
  ':date - :remote-addr - :remote-user ":method :url HTTP/:http-version"',
  ':status :res[content-length] ":referrer" ":user-agent" :response-time',
].join(' ');


/**
 * Access Logger hook
 */
module.exports = (restapi) => {
  return {
    /**
     * Default options
     */
    defaults: {
      accessLogger: true,
    },

    /**
     * Initialize the hook
     */
    initialize: (cb) => {
      if (restapi.config.accessLogger === true) {
        restapi.app.use(morgan(logFormat));
      }

      cb();
    },
  };
};
