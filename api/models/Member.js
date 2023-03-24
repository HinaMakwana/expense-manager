/**
 * Member.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    memberId : {
      model : 'user'
    },
    accountId : {
      model : 'account'
    },
    createdAt : {
      type : 'ref',
      defaultsTo : new Date().getTime()
    },
    isDeleted : {
      type : 'boolean',
      defaultsTo : false
    }
  },
};
