let staff = require('../controller/staff');

exports.checkAdmin = async (req, res, next) => {
    //var staffInfo = await staff.getStaff()
    //console.log(staffInfo);
    console.log(req?.user.emails[0].value);
    next()
}