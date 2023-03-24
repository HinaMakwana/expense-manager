
module.exports = {


  friendlyName: 'Common',


  description: 'Common something.',


  inputs: {
    accId : {
      type : 'string'
    },
    user  : {
      type : 'string'
    },
    date : {
      type : 'ref'
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },

  fn: async function (inputs) {
    let findAccount = await Account.findOne({  id : inputs.accId, user: inputs.user, isDeleted : false });
    if(!findAccount) {
        let findMember = await Member.findOne({ accountId : inputs.accId, memberId : inputs.user, isDeleted : false})
        if(findMember) {
            findAccount = await Account.findOne({ id : inputs.accId, isDeleted : false})
        }
    }
    console.log(findAccount);
    return findAccount;
  }
};
