/**
 * TransactionController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

let id = sails.config.constant.uuid;
let type = sails.config.constant.transactionType;
let httpStatus = sails.config.constant.HttpStatusCode;

module.exports = {

    /**
     *
     * @param {Request} req
     * @param {Response} res
     * @description add transaction
     * @route (POST /transaction/add)
     */
    addTransaction : async (req,res)=> {
        try {
            const user =req.userData.userId;
            const {
                account,
                transactionType,
                date,
                description,
                amount
            } = req.body;
            let result = await Transaction.validate({
                account,
                transactionType,
                date,
                description,
                amount
            })
            if(result.hasError) {
                return res.status(httpStatus.BAD_REQUEST).json({
                    message: 'validation error',
                    error: result.error
                })
            }
            const findAccount = await sails.helpers.common(account,user);
            if(!findAccount){
                return res.status(httpStatus.NOT_FOUND).json({
                    message: 'account not found'
                })
            }
            const newDate = await Transaction.checkDate(date);
            let data = {
                id: id(),
                account : account,
                transactionType : transactionType,
                date : newDate.date,
                description : description,
                amount  : amount,
                createdAt : new Date().getTime(),
                createdBy : user
            }
            if(newDate.msg === 'done') {
                let balance,addTransaction;
                if(transactionType === type.i) {
                    addTransaction = await Transaction.create(data).fetch();
                    balance = findAccount.balance + addTransaction.amount
                }
                if(transactionType === type.e) {
                    if(findAccount.balance > amount){
                        addTransaction = await Transaction.create(data).fetch();
                        balance = findAccount.balance - addTransaction.amount
                    } else {
                        return res.status(httpStatus.BAD_REQUEST).json({
                            message : 'Account balance is low'
                        })
                    }
                }
                await Account.updateOne({
                    id : account,
                    user: findAccount.user
                },{balance : balance})
                return res.status(httpStatus.OK).json({
                    message : 'Transaction added successfully',
                    transaction : addTransaction
                })
            } else {
                return res.status(httpStatus.UNAUTHORIZED).json({
                    message : newDate.msg
                })
            }
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
     * @description list all transaction in latest transaction
     * @route (POST /transaction/list)
     */
    listTransaction : async (req,res)=> {
        try {
            const user =req.userData.userId;
            const { account }= req.body;
            const findAccount = await sails.helpers.common(account,user);
            if(!findAccount){
                return res.status(httpStatus.NOT_FOUND).json({
                    message : 'account is invalid'
                })
            }
            let listTransaction = await Transaction.find({
                account : account,
                isDeleted : false
            })
            .sort('date DESC');
            if(!listTransaction[0]) {
                return res.status(httpStatus.NOT_FOUND).json({
                    message: 'Not found any transaction'
                })
            }
            return res.status(httpStatus.OK).json({
                message : 'Transaction of account ' + account,
                count : listTransaction.length,
                transactions : listTransaction
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
     * @description delete transaction
     * @route (DELETE /transaction/delete)
     */
    deleteTransaction : async (req,res)=> {
        try {
            const user =req.userData.userId;
            const { transactionId } = req.body;
            let findTrans = await Transaction.findOne({
                id : transactionId,
                isDeleted : false
            })
            if(!findTrans) {
                return res.status(httpStatus.NOT_FOUND).json({
                    message: 'Invalid transaciton'
                })
            }
            const findAccount = await sails.helpers.common(findTrans.account,user);
            if(!findAccount) {
                return res.status(httpStatus.NOT_FOUND).json({
                    message: 'only member and owner can delete transaction'
                })
            }
            let balance;
            if(findTrans.transactionType === type.e) {
                balance = findAccount.balance + findTrans.amount
            }
            if(findTrans.transactionType === type.i) {
                if(findAccount.balance > findTrans.amount) {
                    balance = findAccount.balance - findTrans.amount
                } else {
                    return res.status(httpStatus.UNAUTHORIZED).json({
                       message: 'transaction is not delete because account balance is not sufficient'
                    });
                }
            }

            const deleteTrans = await Transaction.updateOne({
                id : transactionId,
                isDeleted: false
            },{
                isDeleted : true,
                deletedAt : new Date().getTime(),
                deletedBy : user
            })
            await Account.updateOne({
                id : findTrans.account,
                isDeleted: false
            }, {
                balance : balance
            })
            return res.status(httpStatus.OK).json({
                message : 'Transaction deleted successfully',
                deleteTransaction : deleteTrans
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
     * @description update transaction
     * @route (PATCH /transaction/update)
     */
    updateTransaction : async (req,res)=> {
        try {
            const user =req.userData.userId;
            const {
                amount,
                description,
                transactionId
            } = req.body;
            let findTrans = await Transaction.findOne({
                id : transactionId,
                isDeleted : false
            })
            if(!findTrans) {
                return res.status(httpStatus.NOT_FOUND).json({
                    message: 'Transaction id invalid'
                })
            }

            const findAccount = await sails.helpers.common(findTrans.account,user);
            if(!findAccount) {
                return res.status(304).json({
                    message: 'only member and owner can update transaction'
                })
            }
            let newAmount,newBalance;
            if(findTrans.transactionType === type.i) {
                newAmount = amount - findTrans.amount;
            } else {
                if(findTrans.transactionType === type.e) {
                    newAmount = findTrans.amount - amount;
                }
            }
            newBalance = findAccount.balance + newAmount;
            if(newBalance > 0) {
                let EditTrans = await Transaction.updateOne({
                    id : transactionId,
                    isDeleted: false
                    }, {
                    amount : amount,
                    description : description,
                    updatedAt : new Date().getTime(),
                    updatedBy : user
                })
                let EditAcc = await Account.updateOne({
                    id : findTrans.account,
                    isDeleted: false
                }, {
                    balance : newBalance
                })
                return res.status(httpStatus.OK).json({
                    message : 'transaction updated successfully',
                    transaction : EditTrans,
                    Account: EditAcc
                })
            } else {
                return res.status(httpStatus.BAD_REQUEST).json({
                    message: 'transaction is not updated'
                })
            }
        } catch (error) {
            return res.status(httpStatus.SERVER_ERROR).json({
                message: 'server error ' + error
            })
        }
    }
};
