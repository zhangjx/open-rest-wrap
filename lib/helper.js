const _ = require('lodash');
const OpenRest = require('open-rest');
const errors = require('./errors');

const { helper, utils } = OpenRest;

// README: 当前 helper 的方法是在 open-rest 提供的 helper 的基础上重写，
// 行为尽量保持一致，替换更好的错误体系
// TODO: helper.batch 下的方法没有重写，如有必要在进行重写

// 检测是否存在
helper.assert.exists = (hook, error) => {
  const err = (error instanceof Error) ? error : errors.ResourceNotFound(hook);
  return (req, res, next) => {
    const model = req.hooks[hook];
    if (!model) { return next(err); }
    if (model.isDelete === 'yes') { return next(err); }
    return next();
  };
};

// 检测必要参数
// Note: 改变了原有的参数列表, 添加了 resource 参数
helper.params.required = (resource, keys) => {
  if (!_.isArray(keys)) { throw Error('params keys must be an array'); }
  if (!_.all(keys, x => _.isString(x))) {
    throw Error('params keys every item must be a string');
  }
  return (req, res, next) => {
    const missings = _.filter(keys, key => !req.params.hasOwnProperty(key));
    if (!missings.length) { return next(); }
    return next(errors.MissingParameter(resource, _.first(missings)));
  };
};

// 保存资源到数据库
helper.rest.save = (Model, hook) => {
  return (req, res, next) => {
    const model = req.hooks[hook];
    // 如果没有变化，则不需要保存，也不需要记录日志
    if (!model.changed()) {
      req._resourceNotChanged = true;
      res.header('X-Content-Resource-Status', 'Unchanged');
      res.send(200, model);
      return next();
    }
    return model.save().then((mod) => {
      res.send(200, mod);
      return next();
    }).catch(error => next(errors.SequelizeIfError(error, Model.name)));
  };
};

// 在保存之前预处理
helper.rest.beforeAdd = (Model, cols, hook = Model.name) => {
  return (req, res, next) => {
    const attr = utils.pickParams(req, cols || Model.writableCols, Model);
    if (Model.rawAttributes.creatorId) { attr.creatorId = req.user.id; }
    if (Model.rawAttributes.clientIp) { attr.clientIp = utils.clientIp(req); }

    // 存储数据
    const _save = model =>
      model.save().then((mod) => {
        req.hooks[hook] = mod;
        return next();
      }).catch(error => next(errors.SequelizeIfError(error, Model.name)))
    ;
    // 如果没有设置唯一属性，或者没有开启回收站
    if (!Model.unique || !Model.rawAttributes.isDelete) {
      return _save(Model.build(attr));
    }

    // 如果设置了唯一属性，且开启了回收站功能
    // 则判断是否需要执行恢复操作
    const where = {};
    for (let i = 0; i < Model.unique.length; i++) { const x = Model.unique[i]; where[x] = attr[x]; }
    return Model.findOne({ where }).then((model) => {
      if (model) {
        if (model.isDelete === 'yes') {
          _.extend(model, attr);
          model.isDelete = 'no';
        } else {
          next(errors.AlreadyExists(Model.name, Model.unique[0]));
        }
      } else {
        model = Model.build(attr);
      }
      return _save(model);
    }).catch(next);
  };
};

module.exports = helper;
