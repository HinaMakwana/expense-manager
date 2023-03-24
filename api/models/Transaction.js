/**
 * Transaction.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    account : {
      model : 'account',
    },
    transactionType : {
      type: 'string',
      isIn: ['e','i'],
      required : true
    },
    amount : {
      type : 'float'
    },
    date : {
      type : 'ref',
      defaultsTo : new Date().getTime()
    },
    description  : {
      type : 'string'
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
    return data;
  },

  validate : async function(req,res) {
     req.check('account').exists().withMessage('accountID is required')
     req.check('transactionType').exists().withMessage('Type of transaction is required')
     req.check('amount').exists().withMessage('amount is required')
     req.check('amount').exists().isFloat().withMessage('enter amount in number only')
     req.check('transactionType').exists().isIn(['e','i']).withMessage('Type of transaction is invalid')
  }

};
