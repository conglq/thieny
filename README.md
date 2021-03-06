[![Build Status](https://travis-ci.org/conglq/thieny.svg?branch=master)](https://travis-ci.org/conglq/thieny)

# Introduction
This lib use for validate javascript form data object send to API before we using this data. Reuse any type of data we defined.

# Example

```javascript
var thieny = require('form-validation-thieny');

let data = {
  email: 'testing@testing.local',
  new_email: 'new_email@testing.local'
};

let result = thieny.required('email') // could be array ['email']
                    .optional('new_email', 'old_email') // could be array ['new_email', 'old_email']
                    .validate(data);

console.log(result);
// success
// {
//   error: null,
//   value: {
//     email: 'testing@testing.local',
//     new_email: 'new_email@testing.local'
//   }
// }

// any error
// {
//   error: {
//     code: 1,
//     msg: 'Invalid email'
//   },
//   value: {}
// }
```
Try [Online Demo](https://runkit.com/58da2ab7d8323e0014c97ed6/58da2ab7d8323e0014c97ed7)

Before do validate, just defined object type and put them when your app start (run first)

```javascript
// add new type defined email type and error that you want to response
thieny.add_type({
  type_name: 'email',
  error_data: {
    code: 1,
    msg: 'Invalid email'
  },
  validate: str => {
    if (str) {
      return {
        value: str
      };
    } else {
      return {
        error: true
      }
    }
  },
  field_names: [{
    name: 'new_email'
  }, {
    name: 'old_email',
    error_data: {
      code: 4,
      msg: 'Invalid old email'
    }
  }]
});

```
# Usage

## add_type
Add new type

* `type_name` **String** name of type
* `error_data` **Any** error object return when invalid data.
* `validate` **Function** function validate data: Can be yourself function or using [@hapi/joi](https://hapi.dev/family/joi/) module

Your function
```javascript
validate: str => {
  // your validate function here
  if (str) {
    return {
      value: str
    };
  } else {
    return {
      error: true
    }
  }
}
```

Using **@hapi/joi**
Reference [API Reference](https://hapi.dev/family/joi/).

```javascript
validate: str => {
  // using @hapi/joi
  return thieny.joi.string().trim().replace(/[^0-9]/g, '').length(10).validate(str);
}
```

  Return an object
  * `error` **Boolean** *optional* true/false
  * `value` **Any** value of input after validate
* `field_names` **Array** *optional* list of fields had the same type
    * `name`
    * `error_data` *optional* error object return when invalid data

## required
List of field (**arg** or **array**) are required in input data

## optional
List of field (**arg** or **array**) are optional in input data

## validate
Validate an object data
Return an object
* `error` **Any** error_data which you defined before in **add_type**
* `value` **Object** An object was return if no error after validate.