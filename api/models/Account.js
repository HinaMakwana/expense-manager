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
    /* user : {
      model : 'User',
      required : true
    } */
    user : {
      collection : 'user',
      via : 'owner'
    }
  }

};
