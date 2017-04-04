const utils = require('./utils');

class TypeObject {
  constructor() {
    this.fields = {};
    this.types = {};
  }

  is_had_type(type) {
    return this.types.hasOwnProperty(type);
  }

  is_had_field(field) {
    return this.fields.hasOwnProperty(field);
  }

  add_new_type(new_type) {
    // check is exist type
    if (this.is_had_type(new_type.type_name)) {
      console.error(new Error('This type: ' + new_type.type_name + ' had declare before'));
      return false;
    }

    this.types[new_type.type_name] = {
      validate: new_type.validate
    };

    this.fields[new_type.type_name] = {
      type: new_type.type_name,
      error_data: new_type.error_data || new Error('Error with field: ' + new_type.type_name)
    };

    return true;
  }

  add_new_field(field_obj, new_type) {

    if (typeof field_obj.name !== 'string') {
      console.error(new Error('invalid field: ' + field_obj.name));
      return false;
    }

    // check duplication field
    if (this.is_had_field(field_obj.name)) {
      console.error(new Error('This field: ' + field_obj.name + ' had declare before'));
      return false;
    }

    this.fields[field_obj.name] = {
      type: new_type.type_name,
      error_data: field_obj.error_data || new_type.error_data || new Error('Error with field: ' + field_obj.name)
    };

    return true;
  }

  get_error(field) {
    return utils.clone_object(this.fields[field].error_data);
  }

  call_validate(field, data) {
    let type = this.fields[field].type;
    return this.types[type].validate(data);
  }
}

module.exports = TypeObject;