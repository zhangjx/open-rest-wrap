const config = require('./extension');

// web service 的一些信息,主要提供给 restify.createServer 使用
config.service = {
  name: config.server.name,
  version: config.server.version,
  port: 8008,
  ip: '0.0.0.0',
};
config.port = 8008;

module.exports = config;
