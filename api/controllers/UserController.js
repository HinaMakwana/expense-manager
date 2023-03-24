/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var validate = require('sails-hook-validation-ev/lib/validate');

module.exports = {
  //user signup
  signup: async (req,res) =>{
    validate(req)
    const errors = await req.getValidationResult();
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()[0].msg });
    }
    const {name, email, password} = req.body;
    let userFind = await User.findOne({email : email});
    if(userFind){
        res.status(409).json({
            message : 'User already exist'
        })
    } else {
            let hash = await bcrypt.hash(password, 10);
            let user = {
                name : name,
                email : email,
                password : hash
            }
            let createUser = await User.create(user).fetch();
            await sails.helpers.sendMail(email,name);
            await sails.models.user.defaultAccount(name,email);
            return res.status(200).json({
                user : createUser,
                message : 'receive mail'
            });
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
            res.status(400).json({
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
