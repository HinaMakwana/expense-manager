/**
 * AccountController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
module.exports = {
    //list all account
    list: async (req,res)=> {
        const user =req.userData.userId;
        let findUser = await Account.find({user : user});
        if(findUser){
            res.status(200).json({
                count : findUser.length,
                Accounts : findUser
            })
        } else {
            res.status(404).json({
                message : 'error'
            })
        }
    },
    //add account
    add: async (req,res)=> {
        const user =req.userData.userId;
        const { name } = req.body;
        let userId =await User.findOne({id : user});
        if(userId){
                let findName =await Account.findOne({name : name, user : user});
                if(findName) {
                    res.status(409).json({
                        message : 'Account is already exist'
                    })
                } else {
                    let addAccount =await Account.create({name : name, user : user}).fetch();
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
        let userId = await Account.find({ user : user }).select('user');
        if(userId) {
            let AccountName = await Account.findOne({ name : name, user : user});
            if(AccountName) {
                let Delete = await Account.destroy({ name : name, user:user});
                res.status(200).send('Account deleted successfully');
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
        let Name = await Account.findOne({name : old_name});
        if(Name){
            let newName = await Account.findOne({name : new_name});
            if(newName) {
                res.status(409).send('account is already exist')
            } else {
                let Update = await Account.updateOne({
                    name : old_name,
                    user : userId
                }).set({ name : new_name});
                res.status(200).send('account updated successfully')
            }
        } else {
            res.status(404).send('account is not found')
        }

    },
};
