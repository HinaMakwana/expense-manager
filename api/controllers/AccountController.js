/**
 * AccountController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
let id = sails.config.constant.uuid;
let httpStatus = sails.config.constant.HttpStatusCode;

module.exports = {
    /**
     *
     * @param {Request} req
     * @param {Response} res
     * @description list all account with owner and member
     * @route (GET /account/list)
     */
    list: async (req,res)=> {
        try {
            const user =req.userData.userId;
            let findUser = await User.findOne({
                id : user,
                isDeleted: false
            })
            .populate('member', { where : {isDeleted : false}});
            if(!findUser) {
                return res.status(httpStatus.BAD_REQUEST).json({
                    message: 'Bad request'
                })
            }
            let findOwner = await Account.find({
                user : user,
                isDeleted : false
            })
            return res.status(httpStatus.OK).json({
                count : findUser.member.length + findOwner.length,
                owner : findOwner,
                member : findUser.member
            })
        } catch (error) {
            return res.status(httpStatus.SERVER_ERROR).json({
                message: 'server error ' + error
            })
        }
    },
    /**
     *
     * @param {Request} req
     * @param {Response} res
     * @description create account
     * @route (POST /account/add)
     */
    add: async (req,res)=> {
        try {
            const user =req.userData.userId;
            const { name } = req.body;
            let result = Account.validate({name,user});
            if(result.hasError) {
                return res.status(httpStatus.BAD_REQUEST).json({
                    message: 'validation error',
                    error: result.error
                })
            }
            let findUser =await User.findOne({
                id : user,
                isDeleted : false
            });
            if(!findUser) {
                return res.status(httpStatus.NOT_FOUND).json({
                    message: 'user not found'
                })
            }
            let findName =await Account.findOne({
                name : name,
                user : user,
                isDeleted : false
            });
            if(findName) {
                return res.status(httpStatus.CONFLICT).json({
                    message : 'Account is already exist'
                })
            }
            const data = {
                id: id(),
                name : name,
                user : user,
                createdBy : user,
                createdAt : new Date().getTime()
            }
            let addAccount =await Account.create(data).fetch();
            return res.status(httpStatus.OK).json({
                data : addAccount
            })
        } catch (error) {
            return res.status(httpStatus.SERVER_ERROR).json({
                message: 'server error ' + error
            })
        }
    },
    /**
     *
     * @param {Request} req
     * @param {Response} res
     * @description delete account
     * @route (DELETE /account/delete)
     */
    deleteAccount: async (req,res)=> {
        try {
            const user = req.userData.userId;
            const { name } = req.body;
            let findUser = await Account.find({
                user : user,
                isDeleted: false
            });
            if(!findUser) {
                return res.status(httpStatus.NOT_FOUND).json({
                    message: "user not found"
                })
            }
            let findAccount = await Account.findOne({
                name : name,
                user : user,
                isDeleted : false
            });
            if(!findAccount) {
                return res.status(httpStatus.NOT_FOUND).json({
                    message: 'account not found'
                })
            }
            let deleteAccount = await Account.updateOne({
                name : name,
                user:user,
                isDeleted: false
            }, {
                isDeleted: true
            });
            await Member.updateOne({
                accountId : deleteAccount.id,
                isDeleted: false
            },{ isDeleted : true })
            await Transaction.updateOne({
                account : deleteAccount.id,
                isDeleted: false
            },{
                isDeleted: true
            })
            return res.status(httpStatus.OK).json({
                message : 'account is deleted sucessfully',
                Account : deleteAccount,
            });
        } catch (error) {
            return res.status(httpStatus.SERVER_ERROR).json({
                message: 'server error ' + error
            })
        }
    },
    /**
     *
     * @param {Request} req
     * @param {Response} res
     * @description edit account
     * @route (PATCH /account/update)
     */
    update: async (req,res)=> {
        try {
            const { new_name, old_name } = req.body;
            const userId = req.userData.userId;
            const data = {
                name : old_name,
                user : userId,
                isDeleted : false
            }
            const data1 = {
                name : new_name,
                user : userId,
                isDeleted : false
            }
            let findAcc = await Account.findOne(data);
            if(!findAcc) {
                return res.status(httpStatus.NOT_FOUND).json({
                    message: 'Account not found'
                })
            }
            let findNewName = await Account.findOne(data1);
            if(findNewName) {
                return res.status(httpStatus.CONFLICT).json({
                    message: 'account is already exist'
                })
            }
            let updateAcc = await Account.updateOne({
                name : old_name,
                user : userId,
                isDeleted : false
            }).set({
                name : new_name,
                updatedAt : new Date().getTime()
            });
            return res.status(httpStatus.OK).json({
                message : 'account updated sucessfully',
                Account : updateAcc
            })
        } catch (error) {
            return res.status(httpStatus.SERVER_ERROR).json({
                message: 'server error ' + error
            })
        }
    },
    /**
     *
     * @param {Request} req
     * @param {Response} res
     * @description add any user to account
     * @route (POST /member/add)
     */
    addMember : async (req,res)=> {
        try {
            const userId = req.userData.userId;
            const { email, accId } = req.body;
            let findDefaultUser = await User.findOne({
                id : userId,
                isDeleted : false
            });
            let findUser = await User.findOne({
                email :email,
                isDeleted: false
            });
            if(findDefaultUser.email === findUser.email) {
                return res.status(httpStatus.CONFLICT).json({
                    message: 'user already account owner not added as member'
                })
            }
            let findAccount = await Account.findOne({
                id : accId ,
                user : findDefaultUser.id,
                isDeleted : false
            });
            if(!findAccount) {
                return res.status(httpStatus.NOT_FOUND).json({
                    message: 'acccount not found'
                })
            }
            const member = {
                memberId : findUser.id,
                accountId : findAccount.id,
                isDeleted : false
            }
            let findMember = await Member.findOne(member);
            if(findMember) {
                return res.status(httpStatus.CONFLICT).json({
                    message: 'user already added as member'
                })
            }
            let createMember = await Member.create({
                id: id(),
                memberId : findUser.id,
                accountId : findAccount.id
            }).fetch()
            // let createMember = await User.addToCollection(findUser.id,'member',findAccount.id);
            return res.status(httpStatus.OK).json({
                message : 'Added member successfully',
                member : createMember
            })
        } catch (error) {
            return res.status(httpStatus.SERVER_ERROR).json({
                message: 'server error ' + error
            })
        }
    }
};
