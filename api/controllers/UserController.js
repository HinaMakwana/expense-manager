/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
let id = sails.config.constant;
let httpStatus = sails.config.constant.HttpStatusCode;

module.exports = {
  /**
   *
   * @param {Request} req
   * @param {Response} res
   * @description register user
   * @route (POST /user/signup)
   */
  signup: async (req,res) =>{
    try {
        const {name, email, password} = req.body;
        let result = await User.validate({
            name,
            email,
            password
        })
        if(result.hasError) {
            return res.status(httpStatus.BAD_REQUEST).json({
                message: 'validation error',
                error : result.error
            })
        }
        let userFind = await User.findOne({
            email : email,
            isDeleted : false
        });
        if(userFind){
            return res.status(httpStatus.CONFLICT).json({
                message : 'User already exist'
            })
        }
        let hash = await bcrypt.hash(password, 10);
        if(!hash) {
            return res.status(httpStatus.SERVER_ERROR).json({
                message: "server error"
            })
        }
        let user = {
            id: id.uuid(),
            name : name,
            email : email,
            password : hash
        }
        let createUser = await User.create(user).fetch();
        await sails.helpers.sendMail(email,name);
        let account = await User.defaultAccount(name,email);
        return res.status(httpStatus.OK).json({
            message : 'user created',
            user : createUser,
            defaultAccount: account
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
   * @description Login user return auth token
   * @route (POST /user/login)
   */
  login: async (req,res)=> {
    try {
        const {email, password} = req.body;
        let result = await User.validate({
            email,
            password
        })
        if(result.hasError) {
            return res.status(httpStatus.BAD_REQUEST).json({
                message: 'validation error',
                error: result.error
            })
        }
        let findUser = await User.findOne({
            email : email,
            isDeleted : false
        });
        if(!findUser) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'invalid email'
            })
        }
        let hashPass = await bcrypt.compare(password, findUser.password);
        if(!hashPass) {
            return res.status(httpStatus.BAD_REQUEST).json({
                message: 'invalid email or password'
            })
        }
        const token = jwt.sign(
            {
            email: findUser.email,
            userId: findUser.id
        },
        process.env.JWT_KEY,
            {
                expiresIn : "8h"
            }
        );
        let updateToken = await User.updateOne(
            {email:findUser.email},
            {token : token}
        );
        return res.status(httpStatus.OK).json({
            messsage: 'login sucessfully',
            data: updateToken
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
   * @description Logout in user account
   * @route (POST /user/logout)
   */
  logout:async (req,res)=>{
    try {
        const user =req.userData.userId;
        let findUser = await User.findOne({
            id : user,
            isDeleted: false
        });
        if(!findUser) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: "user not found"
            })
        }
        let updateToken = await User.updateOne(
            { id : findUser.id},
            { token : null}
        );
        if(!updateToken) {
            return res.status(httpStatus.BAD_REQUEST).json({
                message: 'bad request'
            })
        }
        return res.status(httpStatus.OK).json({
            message: 'logout successfully',
            data: updateToken
        })

    } catch (error) {
        return res.status(httpStatus.SERVER_ERROR).json({
            message: 'server error ' + error
        })
    }
  },
  /**
   * @description User profile, users all accounts with balance
   * @route (GET /profile)
   */
  profile : async (req,res) => {
    try {
        let { userId } = req.userData;
        let findUser = await User.findOne({
            id: userId,
            isDeleted: false
        })
        .select(["name","email"])
        .populate('member')

        if(!findUser) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'user not found'
            })
        }
        let findAccount = await Account.find({
            user: userId
        })
        let query = `
            SELECT "t"."id",
            "t"."account",
            "t"."transactionType",
            "t"."amount",
            "a"."user"
            FROM transaction AS t
            LEFT JOIN account AS a
            ON "t"."account" = "a"."id"
            WHERE "a"."user" = '${userId}'
        `
        let transactions = await sails.sendNativeQuery(query);
        return res.status(httpStatus.OK).json({
            Profile: findUser,
            Accounts: findAccount,
            Transactions: transactions.rows
        })
    } catch (error) {
        return res.status(httpStatus.SERVER_ERROR).json({
            message: 'server error ' + error
        })
    }
  }
};
