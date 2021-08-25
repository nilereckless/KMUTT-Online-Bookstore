let staff = require('../controller/staff');

exports.checkAdmin = async (req, res, next) => {
    var staff = await staff.getStaff()
    console.log(staff);
    console.log(req.user.emails[0].value);
    next()
}