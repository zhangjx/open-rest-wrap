/**
 * Built-in hooks (order matters)
 */
module.exports = {
  dictionary: {
    _config: true,
    _api: true,
  },
  coreMiddleware: {
    acceptParser: true,
    queryParser: true,
    bodyParser: true,
    authorizationParser: false,
    dateParser: false,
    jsonp: false,
    cors: false,
    charset: true,
    gzipResponse: false,
    requestLogger: false,
    serveStatic: false,
  },
};
