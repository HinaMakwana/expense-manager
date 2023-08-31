/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {
    //user controller routes
    'POST /user/signup' : 'UserController.signup',
    'POST /user/login' : 'UserController.login',
    'POST /user/logout' : 'UserController.logout',
    'GET /profile' : 'UserController.profile',

    //account controller routes
    'POST /account/add' : 'AccountController.add',
    'GET /account/list' : 'AccountController.list',
    'DELETE /account/delete' : 'AccountController.deleteAccount',
    'PATCH /account/update' : 'AccountController.update',
    'POST /member/add' : 'AccountController.addMember',

    //transaction controller routes
    'POST /transaction/add' : 'TransactionController.addTransaction',
    'POST /transaction/list' : 'TransactionController.listTransaction',
    'DELETE /transaction/delete' : 'TransactionController.deleteTransaction',
    'PATCH /transaction/update' : 'TransactionController.updateTransaction'
};
