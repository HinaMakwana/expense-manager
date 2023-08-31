
let transactionType = {
	e : "expense",
	i : "income",
	t : "transfer"
}

const HttpStatusCode = {
	OK: 200,
	CREATED: 201,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	CONFLICT: 409,
	UNPROCESSABLE_ENTITY: 422,
	SERVER_ERROR: 500,
};

let validation = {
	User : {
		name: "required|min:3",
		email: "required|email",
		password: [
			"required",
			"regex:/^[a-zA-Z0-9!@#$%^&*]{8,16}$/"
		]
	},
	Account : {
		name: "required|min:3",
		user: "required",
		balance: "integer",
	},
	Transaction : {
		account: "required",
		transactionType: [
			"required",
			{
				"in" : [transactionType.e,transactionType.i,transactionType.t]
			}
		],
		amount : "required|integer",
		description: "string",
		date: "date"
	}
}
let Validator = require('validatorjs')

let uuid = require('uuid-random')

module.exports.constant = {
	transactionType,
	validation,
	Validator,
	uuid,
	HttpStatusCode
}