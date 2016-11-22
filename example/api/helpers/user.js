
const test = () => {
  return (req, res, next) => {
    console.info(req.ips);
    console.info(req.ip);
    console.info(req.isPrivateIP);
    console.info('test user');
    return next();
  };
};

module.exports = {
  test,
};
