module.exports = {
  // 分页设定
  pagination: {
    maxResults: 10,
    maxResultsLimit: 5000,
    maxStartIndex: 500000,
  },

  // sort 设定
  sort: {
    default: 'id',
    allow: ['id', 'createdAt', 'updatedAt'],
  },

  // 根据白名单过滤对象
  filterWhite(object, whiteList = []) {
    if (object != null) {
      Object.keys(object).forEach((key) => {
        if (whiteList.indexOf(key) < 0) {
          delete object[key];
        }
      });
    }
    return object;
  },
};
