
const test = () => {
  return (req, res, next) => {
    console.error('test user');
    return next();
  };
};

module.exports = {
  test,
};
