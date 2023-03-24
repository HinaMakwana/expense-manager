/**
 * TransactionController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var validate = require('sails-hook-validation-ev/lib/validate');

module.exports = {

    //add transaction
    addTransaction : async (req,res)=> {
        validate(req,res)
        const errors = await req.getValidationResult();
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array()[0].msg});
        }
        const user =req.userData.userId;
        const { account, transactionType, date, description, amount} = req.body
        const findAccount = await sails.helpers.common(account,user);
        if(!findAccount){
            return res.status(404).send('account not found')
        }
        const newDate = await Transaction.checkDate(date);
        let data = {
                        account : account,
                        transactionType : transactionType,
                        date : newDate.date,
                        description : description,
                        amount  : amount,
                        createdAt : new Date().getTime(),
                        createdBy : user
                    }
        if(newDate.msg == 'done') {
            let balance,addTransaction;
            if(transactionType == 'i') {
                addTransaction = await Transaction.create(data).fetch();
                balance = findAccount.balance + addTransaction.amount
            } else {
                if(findAccount.balance > amount){
                    addTransaction = await Transaction.create(data).fetch();
                    balance = findAccount.balance - addTransaction.amount
                } else {
                    return res.status(400).json({
                        message : 'Account balance is low'
                    })
                }
            }
            let changeAccount = await Account.updateOne({id : account, user: findAccount.user},{balance : balance})
            res.status(200).json({
                message : 'Transaction added successfully',
                transaction : addTransaction
            })
        } else {
            res.status(300).json({
                message : newDate.msg
            })
        }
    },
    //list all transaction in latest transaction
    listTransaction : async (req,res)=> {
        const user =req.userData.userId;
        const { account }= req.body
        const findAccount = await sails.helpers.common(account,user);
        if(findAccount){
            let listTransaction = await Transaction.find({account : account, isDeleted : false}).sort('date DESC');
            if(listTransaction) {
                res.status(200).json({
                    message : 'Transaction of account ' + account,
                    count : listTransaction.length,
                    transactions : listTransaction
                })
            }
        } else {
            res.status(404).json({
                message : 'account is invalid'
            })
        }
    },
    //delete transaction
    deleteTransaction : async (req,res)=> {
        const user =req.userData.userId;
        const { transactionId } = req.body
        let findTrans = await Transaction.findOne({id : transactionId, isDeleted : false})
        if(findTrans) {
            const findAccount = await sails.helpers.common(findTrans.account,user);
            if(!findAccount) {
              return  res.status(304).send('only member and owner can delete transaction')
            }
            let balance;
            if(findTrans.transactionType == 'e') {
                balance = findAccount.balance + findTrans.amount
            } else {
                if(findAccount.balance > findTrans.amount) {
                    balance = findAccount.balance - findTrans.amount
                } else {
                   return res.status(300).send('transaction is not delete because account balance is not sufficient');
                }
            }
            const deleteTrans = await Transaction.updateOne({id : transactionId},{ isDeleted : true, deletedAt : new Date().getTime(), deletedBy : user})
            const updateAccount = await Account.updateOne({ id : findTrans.account}, { balance : balance })
                res.status(200).json({
                    message : 'Transaction deleted successfully',
                    deleteTransaction : deleteTrans
                })
        } else {
            return res.status(404).send('Transaction id is invalid')
        }
    },
    //update transaction
    updateTransaction : async (req,res)=> {
        const user =req.userData.userId;
        const { amount, description, transactionId } = req.body
        let findTrans = await Transaction.findOne({id : transactionId, isDeleted : false})
        if(findTrans){
            const findAccount = await sails.helpers.common(findTrans.account,user);
            if(!findAccount) {
                res.status(304).send('only member and owner can update transaction')
            } else {
                let newAmount,newBalance
                if(findTrans.transactionType == 'i') {
                    newAmount = amount - findTrans.amount
                } else {
                    newAmount = findTrans.amount - amount
                }
                newBalance = findAccount.balance + newAmount
                if(newBalance > 0) {
                    let EditTrans = await Transaction.updateOne({ id : transactionId }, { amount : amount, description : description, updatedAt : new Date().getTime(), updatedBy : user})
                    let EditAcc = await Account.updateOne({ id : findTrans.account }, { balance : newBalance})
                    res.status(200).json({
                        message : 'transaction updated successfully',
                        transaction : EditTrans
                    })
                } else {
                    res.status(300).send('transaction is not updated')
                }
            }
        } else {
            res.status(404).send('Transaction id is invalid')
        }
    }
};
