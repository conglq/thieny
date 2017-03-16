'use strict';
const joi = require('joi');

var TYPE_OBJECT = {};
var FIELD_OBJECT = {};

/**
 * Validation class
 * 
 * @class Validation
 */
class Validation {

  /**
   * Creates an instance of Validation.
   * @param {any} options 
   * @param {Boolean} options.is_prod is production mode
   * 
   * @memberOf Validation
   */
  constructor(options) {
    if (!options || typeof options != 'object') {
      options = {};
    }

    this.is_prod = !!options.is_prod;
    this.joi = joi;
  }

  error_handler(error) {
    return error;
  }

  result_handler(error, validated_data) {
    return {
      error: this.error_handler(error),
      value: validated_data
    }
  }

  validate(data) {

    let obj = null;

    if (!this._required_field && !this._optional_field) {
      return result_handler(new Error('no schema field'));
    } else {
      obj = this;
    }

    let error = null;
    let validated_data = {};
    let arr = [{
      values: obj._required_field,
      is_required: true
    }, {
      values: obj._optional_field,
      is_required: false
    }];

    arr.every(func => {
      // ignore if no fields
      if (!func.values) {
        return true;
      }
      // check required field
      return func.values.every(field => {
        // is defined type
        if (!FIELD_OBJECT[field]) {
          error = new Error('not defined this type: ' + field)
          return false;
        }

        // check has property
        if (data[field] === undefined) {
          if (func.is_required) {
            error = FIELD_OBJECT[field].error_data;
            return false;
          }
          return true;
        }

        // check valid value
        let result = FIELD_OBJECT[field].validate(data[field]);
        if (result.error) {
          error = FIELD_OBJECT[field].error_data;
          return false;
        }

        // get new value
        validated_data[field] = result.value;
        return true;
      });
    });

    return this.result_handler(error, validated_data);
  }

  get_field(field_schema, args) {
    let obj = !this._required_field && !this._optional_field ? new Data() : this;
    let fields = obj[field_schema] || [];

    if (args.length > 0) {

      let n = args.length;

      for (let i = 0; i < n; i++) {
        if (typeof args[i] === 'string') {
          fields.push(args[i]);
        } else {
          if (Array.isArray(args[i])) {
            fields = fields.concat(args[i]);
          }
        }
      }
    }

    obj[field_schema] = fields;

    return obj;
  }

  /**
   * (field1: String, field2: String, ...) chain of string
   * 
   * @returns 
   * 
   * @memberOf Validation
   */
  required() {
    let args = arguments;
    return this.get_field('_required_field', args);
  }

  /**
   * (field1: String, field2: String, ...) chain of string
   * 
   * @returns 
   * 
   * @memberOf Validation
   */
  optional() {
    let args = arguments;
    return this.get_field('_optional_field', args);
  }

  /**
   * 
   * 
   * @param {Object} new_type 
   * @param {String} new_type.type_name name of type
   * @param {Joi} new_type.validate validate function may be using joi
   * @param {Joi} new_type.error_data error to return when invalid data type input
   * @param {Array} new_type.field_names 
   * @param {String} new_type.field_names.name name of field 
   * @param {Object} new_type.field_names.error_data error to return when invalid data type input
   * @returns 
   * 
   * @memberOf Validation
   */
  add_type(new_type) {

    if (!new_type || typeof new_type.type_name !== 'string') {
      return new Error('invalid new_type');
    }

    if (typeof new_type.validate !== 'function') {
      return new Error('invalidate function');
    }

    let validate = TYPE_OBJECT[new_type.type_name] = new_type.validate;
    // set type name as it self field
    FIELD_OBJECT[new_type.type_name] = {
      validate: validate,
      error_data: new_type.error_data || new Error('Error with field: ' + new_type.type_name)
    };

    if (new_type.field_names && Array.isArray(new_type.field_names)) {
      // set array name of type
      return new_type.field_names.every(field_obj => {
        if (!field_obj.name) {
          console.error(new Error('invalid field: ' + field_obj.name));
          return false;
        }

        if (FIELD_OBJECT[field_obj.name]) {
          console.warn(new Error('overide field: ' + field_obj.name));
        }

        // set validate, error_data:error_code/msg/...
        FIELD_OBJECT[field_obj.name] = {
          validate: validate,
          error_data: field_obj.error_data || new_type.error_data || new Error('Error with field: ' + field_obj.name)
        };

        return true;
      });
    }

    return true;

  }

}

class Data extends Validation {
  constructor() {
    super();
  }
}

module.exports = exports = new Validation();