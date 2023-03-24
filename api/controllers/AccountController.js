/**
 * AccountController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var validate = require('sails-hook-validation-ev/lib/validate');


module.exports = {
    //list all account with owner and member
    list: async (req,res)=> {
        const user =req.userData.userId;
        let findUser = await User.findOne({id : user}).populate('member', { where : {isDeleted : false}});
        let findOwner = await Account.find({ user : user, isDeleted : false })
            res.status(200).json({
                count : findUser.member.length + findOwner.length,
                owner : findOwner,
                member : findUser.member
            })
    },
    //add account
    add: async (req,res)=> {
        validate(req)
        const errors = await req.getValidationResult();
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array()[0].msg });
        }
        const user =req.userData.userId;
        const { name } = req.body;
        let userId =await User.findOne({id : user});
        if(userId){
                let findName =await Account.findOne({name : name, user : user, isDeleted : false});
                if(findName) {
                    res.status(409).json({
                        message : 'Account is already exist'
                    })
                } else {
                    const data = {name : name, user : user, createdBy : user, createdAt : new Date().getTime()}
                    let addAccount =await Account.create(data).fetch();
                    res.status(200).json({
                        data : addAccount
                    })
                }
        } else {
            res.status(500).send('user not found')
        }
    },
    //delete account
    delete: async (req,res)=> {
        const user = req.userData.userId;
        const { name } = req.body;
        let userId = await Account.find({ user : user });
        if(userId) {
            let AccountName = await Account.findOne({ name : name, user : user, isDeleted : false});
            let data = { deletedBy : user, deletedAt : new Date().getTime(), isDeleted : true}
            if(AccountName) {
                let Delete = await Account.updateOne({ name : name, user:user}, data);
                let findMember = await Member.update({accountId : Delete.id},{ isDeleted : true })
                let findTrnsaction = await Transaction.update({account : Delete.id},data)
                return res.status(200).json({
                    message : 'account is deleted sucessfully',
                    Account : Delete,
                });
            } else {
                res.status(404).send('Account not found');
            }
        } else {
            res.status(404).send('User not found');
        }
    },
    //edit account
    update: async (req,res)=> {
        const { new_name, old_name } = req.body;
        const userId = req.userData.userId;
        let Name = await Account.findOne({name : old_name, user : userId, isDeleted : false});
        if(Name){
            let newName = await Account.findOne({name : new_name, user : userId, isDeleted : false});
            if(newName) {
                res.status(409).send('account is already exist')
            } else {
                let Update = await Account.updateOne({
                    name : old_name,
                    user : userId,
                    isDeleted : false
                }).set({ name : new_name, updatedAt : new Date().getTime()});
                res.status(200).send('account updated successfully')
            }
        } else {
            res.status(404).send('account is not found')
        }
    },
    //add any user to account
    addMember : async (req,res)=> {
        const userId = req.userData.userId
        const { email, accId } = req.body
        let findDefaultUser = await User.findOne({id : userId});
            let findUser = await User.findOne({email :email});
            if(findUser.email != findDefaultUser.email) {
                let findAccount = await Account.findOne({ id : accId , user : findDefaultUser.id, isDeleted : false});
                if(findAccount) {
                    const member = {memberId : findUser.id, accountId : findAccount.id, isDeleted : false}
                    let findMember = await Member.findOne(member);
                    if(!findMember){
                        let createMember = await User.addToCollection(findUser.id,'member',findAccount.id);
                        res.status(200).json({
                        message : 'Added member successfully',
                        member : createMember
                        })
                    } else {
                        res.status(409).send('member already added');
                    }
                } else {
                    res.status(201).send('Account is incorrect');
                }
            } else {
                res.status(409).send('User is already added as owner');
            }
    }
};
