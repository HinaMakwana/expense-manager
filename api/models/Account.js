/**
 * Account.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
module.exports = {

  attributes: {

    name : {
      type : 'string',
      required : true
    },
    user : {
      model : 'user'
    },
    balance : {
      type : 'float',
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

  validate : async function(req) {
    req.check('name').exists().withMessage('name is required')
  }

};
