/**
 * Logger hook
 */
module.exports = (restapi) => {
  return {
    /**
     * Default options
     */
    defaults: {
      requestLogger: true,
    },

    /**
     * Initialize the hook
     */
    initialize: (cb) => {
      if (restapi.config.requestLogger === true) {
        restapi.app.use(restapi.restify.requestLogger());
      }

      cb();
    },
  };
};
