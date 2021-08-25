let staff = require('../controller/staff');

exports.checkAdmin = async (req, res, next) => {
    //var staffInfo = await staff.getStaff()
    //console.log(staffInfo);
    if(req.user!=undefined){
        console.log(req.user.emails[0].value);
    }
    next()
}