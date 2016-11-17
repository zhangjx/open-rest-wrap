const _ = require('lodash');
const async = require('async');
const Sequelize = require('sequelize');

let Models = {};

module.exports = function Model(dbConfig, models, reset) {
  if (!dbConfig || !_.isPlainObject(dbConfig)) {
    throw new Error('Error: No `dbConfig` specified!');
  }

  if (!models || !_.isPlainObject(models)) {
    throw new Error('Argument `models` must be an object!');
  }

  // Reset Models
  if (reset === true) Models = {};

  // Init Sequelize
  const sequelize = new Sequelize(dbConfig.name, dbConfig.user, dbConfig.pass, dbConfig);
  // Set timezone 0
  sequelize.query("SET time_zone='+0:00'").catch(err => console.error(err));

  async.series([
    cb => defineModel(sequelize, models, Models, cb),
    cb => handleIncludes(Models, cb),
    cb => handleSearchCols(Models, cb),
  ], (err) => {
    if (err) {
      console.error(err);
    }
    return Models;
  });
  return Models;

  function defineModel(sequelize, models, Models, cb) {
    // Each model settings define model
    _.each(models.settings, (v, k) => {
      Models[k] = Model[k] || v(sequelize);
    });

    // Handle model relation
    _.each(models.relations, v => v(Models));

    return cb();
  }

  function handleIncludes(Models, cb) {
    _.each(Models, (Model, name) => {
      let includes;
      if (!Model.includes) return;

      if (_.isArray(Model.includes)) {
        includes = {};
        _.each(Model.includes, include => includes[include] = include);
        Model.includes = includes;
      }

      _.each(Model.includes, (v, k) => {
        if (!_.isArray(v)) {
          v = [v, true];
        }
        const [modelName, required] = v;
        Model.includes[k] = {
          model: Models[modelName],
          as: k,
          required,
        };
      });
    });
    return cb();
  }

  function handleSearchCols(Models, cb) {
    _.each(Models, (Model, name) => {
      if (!Model.searchCols) return;
      _.each(Model.searchCols, (v, k) => {
        if (_.isString(v.match)) v.match = [v.match];
      });
    });
    return cb();
  }
};
