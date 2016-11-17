module.exports = {
  server: {
    // web server 的一些信息
    name: 'PlanMaster API',
    version: '0.1.0',
    host: 'localhost',
    port: 9988,

    // 站点地址
    siteUrl: 'http://www.planning.com',

    // 时间，日期格式化的格式
    dateFormat: 'YYYY-MM-DD',
    dateTimeFormat: 'YYYY-MM-DD HH:mm:ss',
  },
  globals: {
    _: true,
    async: true,
    mysql: true,
    Sequelize: true,
  },
  coreMiddlewares: {
    queryParser: true,
    bodyParser: true,
    charset: true,
  },
  externalMiddlewares: {
    console: true,
  },
  queryParser: {
    mapParams: false,
  },
  database: {
    host: '127.0.0.1',
    port: 3306,
    name: 'test',
    encode: {
      set: 'utf8',
      collation: 'utf8_general_ci',
    },
    user: 'root',
    pass: 'root',
    dialect: 'mysql',
    dialectOptions: {
      supportBigNumbers: true,
    },
    logging: false,
    define: {
      underscored: false,
      freezeTableName: true,
      syncOnAssociation: false,
      charset: 'utf8',
      collate: 'utf8_general_ci',
      engine: 'InnoDB',
    },
    syncOnAssociation: true,
    pool: {
      min: 2,
      max: 10,
      // 单位毫秒
      idle: 300 * 1000,
    },
  },
  // bodyParser: {
  //   maxBodySize: 0,
  //   mapParams: true,
  //   overrideParams: false,
  // },
  // charset: {
  //   charset: 'utf-8',
  // },
};
