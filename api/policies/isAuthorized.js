const jwt = require('jsonwebtoken');

module.exports =async (req,res,next) =>{
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        let user = await User.findOne({id : decoded.userId});
        if(token == user.token) {
            req.userData = decoded;
            return next();
        } else {
            res.status(401).json({
                message: 'Token invalid'
            });
        }
    } catch(error) {
        return res.status(401).json({
            message: 'Auth failed'
        });
    }
}