const nodemailer = require('nodemailer');

module.exports = {


  friendlyName: 'Send mail',

  description: '',

  inputs: {
    email : {
      type : 'string'
    },
    name : {
      type : 'string'
    }
  },

  exits: {

    success: {
      description: 'All done.',
    },

  },

  fn: async function (inputs) {
    const mail = inputs.email;
    let transport = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: { user: process.env.AUTH, pass: process.env.PASS }
    });
    let message  = {
      from : '"zignuts" <zignuts@gmail.com>',
      to : mail,
      subject : "testing",
      text : "Hello",
      html : "welcome to zignuts " + inputs.name
  }
    transport.sendMail(message)
  }

};
