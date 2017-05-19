'use strict';

exports.clone_object = object => {
  if (typeof object === 'object') {
    return JSON.parse(JSON.stringify(object));
  }
  return object;
}