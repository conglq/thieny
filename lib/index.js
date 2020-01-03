'use strict';

const joi = require('@hapi/joi');
const TypeObject = require('./type');

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
  constructor(options, type_object) {
    if (!options || typeof options != 'object') {
      options = {};
    }
    this.type_object = type_object || new TypeObject();
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

  validate(data = {}) {

    let obj = null;

    if (!this._required_field && !this._optional_field) {
      return result_handler(new Error('form-validation-thieny: No schema field'));
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
        if (!this.type_object.is_had_field(field)) {
          error = new Error('form-validation-thieny: No defined type = ' + field);
          return false;
        }

        // check has property
        if (data[field] === undefined) {
          if (func.is_required) {
            error = this.type_object.get_error(field);
            return false;
          }
          return true;
        }

        // check valid value
        let result = this.type_object.call_validate(field, data[field]);

        if (result.error) {
          error = this.type_object.get_error(field);
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
    let obj = !this._required_field && !this._optional_field ? new Data(this.optional, this.type_object) : this;
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
   * @param {Any} new_type.validate validate function may be using joi
   * @param {Any} new_type.error_data error object to return when Invalid data type input
   * @param {Array} new_type.field_names 
   * @param {String} new_type.field_names.name name of field 
   * @param {Object} new_type.field_names.error_data error to return when Invalid data type input
   * @returns 
   * 
   * @memberOf Validation
   */
  add_type(new_type) {

    // validate new type
    if (!new_type || typeof new_type.type_name !== 'string') {
      console.error(new Error('form-validation-thieny: Invalid new_type'));
      return false;
    }

    if (typeof new_type.validate !== 'function') {
      console.error(new Error('form-validation-thieny: Invalid validate function'))
      return false;
    }

    // add new type and set it as new field
    let result = this.type_object.add_new_type(new_type);
    if (result !== true) {
      return result;
    }

    if (new_type.field_names && Array.isArray(new_type.field_names)) {
      // set fields had the same type
      return new_type.field_names.every(field_obj => {
        // add new field_names
        let result = this.type_object.add_new_field(field_obj, new_type);

        if (result !== true) {
          console.error(result);
          return false;
        }

        return true;
      });
    }

    return true;
  }

}

class Data extends Validation {
  constructor(options, type_object) {
    super(options, type_object);
  }
}

module.exports = exports = new Validation();