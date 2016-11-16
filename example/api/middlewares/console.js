module.exports = (restapi) => {
  return {
    defaults: {

    },

    initialize: (cb) => {
      restapi.app.use((req, res, next) => {
        console.log('custom middleware!!!');
        return next();
      });

      cb();
    },
  };
};
