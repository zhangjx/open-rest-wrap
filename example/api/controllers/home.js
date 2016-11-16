// User = restapi.model('user');

module.exports = {
  index: (req, res, next) => {
    res.send(200, 'hello, world!');
    // restapi.log.info('hhhhhhhhhh');
    next();
  },

  users: (req, res, next) => {
    restapi.models.user.findAll().then((users) => {
      users = _.map(users, (u) => u.toJSON());
      console.log(users);
      return res.send(users);
    });
  },
};
