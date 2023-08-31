/**
 * Transaction.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
let types = sails.config.constant.transactionType;
let validateData = sails.config.constant.validation.Transaction;
let Validator = sails.config.constant.Validator;

module.exports = {

  attributes: {

    account : {
      model : 'account',
      required: true
    },
    transactionType : {
      type: 'string',
      isIn: [types.e,types.i,types.t],
      required : true
    },
    amount : {
      type : 'number',
      required: true
    },
    date : {
      type : 'ref',
      defaultsTo : new Date().getTime()
    },
    description  : {
      type : 'string',
      allowNull: true
    },
    isDeleted : {
      type : 'boolean',
      defaultsTo : false
    }
  },

  checkDate : async function(attr1) {
    let newDate = Date.parse(attr1)
    let todayDate = new Date().getTime()
    let msg;
    console.log(newDate,todayDate);
    if(isNaN(newDate)) {
        msg = 'Date is invalid'
    } else if( newDate > todayDate) {
        msg = 'Date is not accepted'
    } else {
        msg = 'done'
    }
    let data = {
      date : newDate,
      msg : msg
    }
    console.log(data);
    return data;
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
