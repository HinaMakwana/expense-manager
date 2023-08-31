/**
 * Account.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
let validateData = sails.config.constant.validation.Account;
let Validator = sails.config.constant.Validator;

module.exports = {

  attributes: {

    name : {
      type : 'string',
      required : true
    },
    user : {
      model : 'user',
      required: true
    },
    balance : {
      type : 'number',
      defaultsTo : 0.0
    },
    users : {
      collection : 'user',
      via : 'accountId',
      through : 'member'
    },
    isDeleted : {
      type : 'boolean',
      defaultsTo : false
    }
  },

  validate : async function(data) {
    let requiredRules = Object.keys(validateData).filter((key)=> {
      if(Object.keys(data).indexOf(key)>= 0) {
        return key
      }
    })
    let rules = {};
    requiredRules.forEach((val)=> {
      rules[val] = validateData[val]
    })
    let validate = new Validator(data,rules)
    let result = {}
    if(validate.passes()){
      console.log('validate success');
      result['hasError'] = false
      return data
    }
    if(validate.fails()) {
      console.log(1);
      result['hasError'] = true
      result['error'] = validate.errors.all()
    }
    return result
  }

};
