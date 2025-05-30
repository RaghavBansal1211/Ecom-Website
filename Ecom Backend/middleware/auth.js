const { getUser } = require("../auth");

async function restrictToLoggedInUserOnly(req,res,next){
    const userid = req.headers['authorization'];

    if(!userid) return res.status(404).json({
        message:"Token not found"
    })

    const token = userid.split('Bearer ')[1]; 

    const user = getUser(token);
    
    if(!user) return res.status(404).json({
        message:"User Not found"
    });

    req.user = user;
    next();
}



function restrictTo(roles){
    return function(req,res,next){
        if(!req.user) return res.status(404).json({
            message:"User not Logged In"
        })

        if(!roles.includes(req.user.role)) return res.status(401).json({
            message:"User not authorized to access this route"
        }) 

        return next();
    }
}




module.exports = {restrictToLoggedInUserOnly,restrictTo};
