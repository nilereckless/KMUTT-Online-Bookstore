let staff = require('../controller/staff');

exports.checkAdmin = async (req, res, next) => {
   
    //console.log(staffInfo);
    if(req.user!=undefined){
        var staffInfo = await staff.getStaff(req.user.emails[0].value)
        req.staff = staffInfo
    } else {
        req.staff = [];
    }
   
    next()
}