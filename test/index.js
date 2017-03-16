var expect = require('chai').expect;


describe('Testing', () => {
  let thieny;

  it('init', () => {
    thieny = require('../index');
    expect(thieny).to.be.a('object');
  });


  it('method work', () => {
    let result = thieny.required().optional().validate()
    expect(result).to.be.a('object');
    expect(result).to.have.property('error').that.to.be.null;
    expect(result).to.have.property('value').to.be.a('object');
  });

  describe('Normal type', () => {
    it('add type work', () => {
      let result = thieny.add_type({
        type_name: 'email',
        error_data: {
          code: 1,
          msg: 'Invalid email'
        },
        field_names: [{
          name: 'new_email'
        }, {
          name: 'old_email',
          error_data: {
            code: 4,
            msg: 'Invalid old email'
          }
        }],
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
        }
      });


      expect(result).to.be.true;
    });

    it('validate work success', () => {
      let result = thieny.required('email').optional('new_email', 'old_email').validate({
        email: 'testing@testing.local',
        new_email: 'new_email@testing.local'
      })

      expect(result).to.be.a('object');
      expect(result).to.have.property('error').that.to.be.null;
      expect(result).to.have.property('value').to.be.a('object').to.have.property('email').to.eq('testing@testing.local');
      expect(result.value.new_email).to.eq('new_email@testing.local');
      expect(result.value).to.not.have.property('old_email');
    });

    it('validate work return error', () => {
      let result = thieny.required('email').optional().validate({
        email: ''
      })

      expect(result).to.be.a('object');
      expect(result).to.have.property('error').to.be.a('object').to.have.property('code').to.eq(1);
    });

    it('validate work return error with new_email', () => {
      let result = thieny.required(['new_email']).optional().validate({
        new_email: ''
      })
      expect(result).to.be.a('object');
      expect(result).to.have.property('error').to.be.a('object').to.have.property('code').to.eq(1);
    });

    it('validate work return error with old_email', () => {
      let result = thieny.required(['old_email']).optional(['email']).validate({
        old_email: ''
      })
      expect(result).to.be.a('object');
      expect(result).to.have.property('error').to.be.a('object').to.have.property('code').to.eq(4);
    });

  });

  describe('Using Joi/happy.js', () => {
    it('add type with joi', () => {
      let result = thieny.add_type({
        type_name: 'phone',
        error_data: {
          code: 2,
          msg: 'Invalid phone'
        },
        validate: str => {
          return thieny.joi.validate(str, thieny.joi.string().trim().replace(/[^0-9]/g, '').length(10));
        }
      });
      expect(result).to.be.true;
    });


    it('validate work success', () => {
      let result = thieny.required('phone').optional().validate({
        phone: '0123456789a'
      });

      expect(result).to.be.a('object');
      expect(result).to.have.property('error').that.to.be.null;
      expect(result).to.have.property('value').to.be.a('object').to.have.property('phone').to.eq('0123456789');
    });
  });

});