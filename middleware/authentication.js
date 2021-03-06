let staff = require('../controller/staff');

exports.checkAdmin = async (req, res, next) => {
    if (req.user != undefined) {
        var staffInfo = await staff.getStaff(req.user.email)
        req.staff = staffInfo
    } else {
        req.staff = [];
    }

    next()
}

exports.isAuthenticated = async (req, res, next) => {

   if (!req.user) {
        res.redirect('/');
    } 
    next()


}

exports.isStaffAuthenticated = async (req, res, next) => {

    if (!req.user) {
        res.redirect('/');
    } else {
        var staffInfo = await staff.getStaff(req.user.email)
        if (staffInfo.length === 0) {
            res.redirect('/');
        }
    }
    next()


}

exports.isAuthenticatedCart = async (req, res, next) => {

   if (!req.user) {
        res.json('Unauthorized') ;
    } 
    // จะลองLogin Cartค่อยเปิด
    next()


}