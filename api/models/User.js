/**
 * User.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {

   name : {
    type : 'string'
   },
   email: {
    type : 'string',
    isEmail : true
   },
   password: {
    type : 'string',
    minLength : 8,
   },
   token : { type : 'string'},
   member : {
    collection : 'account',
    via : 'memberId',
    through : 'member'
   }
  },

  defaultAccount : async function(attribute1,attribute2) {
      let findUser = await User.findOne({email : attribute2});
      if(findUser){
        const account = {
          name : attribute1,
          user : findUser.id,
          createdBy : findUser.id,
          createdAt : new Date().getTime()
        }
        let createAccount = await Account.create(account);
        console.log('account create');
      }
  },
  validate : async function(req) {
   req.check('name').exists().withMessage('name is required')
   req.check('email').exists().withMessage('email is required')
   req.check('email').exists().isEmail().withMessage('enter valid email')
   req.check('password').exists().withMessage('password is required')
   req.check('password').exists().isLength({ min : 8 }).withMessage('must be at least 8 character long')
  }
};
