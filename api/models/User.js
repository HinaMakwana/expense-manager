/**
 * User.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
let validateData = sails.config.constant.validation.User;
let Validator = sails.config.constant.Validator;
let id = sails.config.constant;
module.exports = {
  attributes: {

   name : {
    type : 'string',
    required: true
   },
   email: {
    type : 'string',
    isEmail : true,
    required: true
   },
   password: {
    type : 'string',
    minLength : 8,
    required: true
   },
   token : {
    type : 'string',
    allowNull : true
  },
   isDeleted : {
    type : 'boolean',
    defaultsTo : false
   },
   //through association
   member : {
    collection : 'account',
    via : 'memberId',
    through : 'member'
   }
  },

  defaultAccount : async function(attribute1,attribute2) {
      let findUser = await User.findOne({email : attribute2});
      if(!findUser){
        return false
      }
      const account = {
        id: id.uuid(),
        name : attribute1,
        user : findUser.id,
        createdBy : findUser.id,
        createdAt : new Date().getTime()
      }
      let createAcc = await Account.create(account).fetch();
      console.log('account create');
      return createAcc
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
