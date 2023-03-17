/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

const AccountController = require("../api/controllers/AccountController");


module.exports.routes = {
    //user controller routes
    'POST /user/signup' : 'UserController.signup',
    'POST /user/login' : 'UserController.login',
    'POST /user/logout' : 'UserController.logout',
    'GET /user/list' : 'UserController.list',

    //account controller routes
    'POST /account/add' : 'AccountController.add',
    'GET /account/list' : 'AccountController.list',
    'DELETE /account/delete' : 'AccountController.delete',
    'PATCH /account/update' : 'AccountController.update'

};
