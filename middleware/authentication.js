let staff = require('../controller/staff');

exports.checkAdmin = async (req, res, next) => {
   
    //console.log(staffInfo);
    if(req.user!=undefined){
        var data = {
            email: req.user.emails[0].value
        }
        var staffInfo = await staff.getStaff(data)
        console.log("staffInfo",staffInfo);
    }
    next()
}