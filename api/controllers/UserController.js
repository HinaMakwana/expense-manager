/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

module.exports = {
  //user signup
  signup: async (req,res) =>{
    /** testing account */
    let transport = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: { user: "f92a35a294cae1", pass: "11e4263e3c726e" }
      });

    const {name, email, password} = req.body;
    let userFind = await User.findOne({email : email});
    if(userFind){
        res.status(409).json({
            message : 'User already exist'
        })
    } else {
        if(password.length >= 8){
            let hash = await bcrypt.hash(password, 10);
            let user = {
                name : name,
                email : email,
                password : hash
            }
            let createUser = await User.create(user).fetch();
            let message  = {
                from : '"zignuts" <zignuts@gmail.com>',
                to : createUser.email,
                subject : "testing",
                text : "Hello",
                html : "<b>Welcome to zignuts</b>"
            }
            transport.sendMail(message).then(()=>{
                return res.status(200).json({
                    user : createUser,
                    message : 'receive mail'
                });
            }).catch(err=>{
                res.status(500).json({
                    error : err
                })
            })
            const account = {
                name : name,
                user : createUser.id
            }
            let createAccount = await Account.create(account);
            } else {
                res.send('enter minimum 8 character long password')
            }
        }
  },
  //user login
  login: async (req,res)=> {
    const {email, password} = req.body;
    let findUser = await User.findOne({email : email});
    if(findUser) {
        let hashPass = await bcrypt.compare(password, findUser.password);
        if(hashPass) {
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
            let Edit = await User.update({email:findUser.email},{token : token}).fetch();
            if(Edit) {
                res.status(200).json({
                    message: 'Auth successful',
                    token: token
                });
            } else {
                res.status(500).send('Database Error')
            }
        } else {
            res.status(404).json({
                message : 'Password is invalid'
            })
        }
    } else {
        res.status(404).json({
            message : 'Email address is invalid'
        })
    }
  },
  //user logout
  logout:async (req,res)=>{
    const user =req.userData.userId;
    let findUser = await User.findOne({id : user});
    if(findUser) {
        let Edit = await User.update({ id : findUser.id}, { token : ""}).fetch();
        if(Edit) {
            res.status(200).end('logout successfully');
        } else {
            res.status(500).send('Database error');
        }
    }
  }
};
