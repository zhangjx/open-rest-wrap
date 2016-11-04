const _ = require('lodash');
const OpenRest = require('open-rest');
const RestErrors = require('./rest-error');

const { Sequelize } = OpenRest;

const buildError = (resource, field, code, msg) =>
  ({
    message: msg,
    errors: [{ resource, field, code }],
  })
;

let errors;
module.exports = errors = {

  RestErrors,

  Internal(msg) {
    return new RestErrors.InternalError(msg);
  },

  BadRequest(msg) {
    return new RestErrors.BadRequestError(msg);
  },

  UnAuthorized(msg) {
    return new RestErrors.UnAuthorizedError(msg);
  },

  PermissionDenied(resource, field = null, msg) {
    const error = buildError(resource, field, 'permissionDenied', msg);
    return new RestErrors.PermissionDeniedError(error);
  },

  ResourceNotFound(resource = null, field = null, msg) {
    const error = buildError(resource, field, 'missing', msg);
    return new RestErrors.ResourceNotFoundError(error);
  },

  ExceedLimit(resource, field = null, msg) {
    const error = buildError(resource, field, 'exceedLimit', msg);
    return new RestErrors.ExceedLimitError(error);
  },

  AlreadyExists(resource, field, msg) {
    const error = buildError(resource, field, 'alreadyExists', msg);
    return new RestErrors.AlreadyExistsError(error);
  },

  InvalidArgument(resource, field, msg) {
    const error = buildError(resource, field, 'invalid', msg);
    return new RestErrors.InvalidArgumentError(error);
  },

  MissingParameter(resource, field, msg) {
    const error = buildError(resource, field, 'missingField', msg);
    return new RestErrors.MissingParameterError(error);
  },

  IfError(error, resource) {
    if (!error) { return null; }
    if (error instanceof Sequelize.Error) {
      return errors.SequelizeIfError(error, resource);
    }
    return new RestErrors.InternalError(error.message);
  },

  // Validation error -> invalid
  // string violation -> invalid
  // notNull Violation -> missing_field
  // unique violation -> already_exists
  SequelizeIfError(error, resource) {
    if (typeof error === 'string') { [resource, error] = [error, resource]; }
    if (!resource) { throw new Error('Missing `resource` parameter'); }
    if (!error) { return null; }
    const errs = [];
    if (error.name === 'SequelizeValidationError') {
      _.each(error.errors, (v) => {
        const obj = {
          resource,
          field: v.path,
          message: v.message,
          code: v.type === 'notNull Violation' ? 'missingField' : 'invalid',
        };
        return errs.push(obj);
      });
      return new RestErrors.ValidationFailedError({ errors: errs });
    } else if (error.name === 'SequelizeUniqueConstraintError') {
      _.each(error.errors, (v) => {
        const obj = {
          resource,
          field: v.path,
          message: v.message,
          code: 'alreadyExists',
        };
        return errs.push(obj);
      }
      );
      return new RestErrors.AlreadyExistsError({ errors: errs });
    }
    return new RestErrors.InternalError(error.message);
  },
};
