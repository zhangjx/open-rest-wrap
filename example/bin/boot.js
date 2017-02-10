const OpenRestWrap = require('../../');
const async = require('async');

// Define NODE_ENV
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

// Run Serve
const restapi = new OpenRestWrap();
async.waterfall([
  (cb) => {
    restapi.load(cb);
  },
  (restapi, cb) => {
    restapi.models('user').findOne().then((user) => {
      cb(null, user);
    });
  },
], (err, result) => {
  console.log(result.toJSON());
});

