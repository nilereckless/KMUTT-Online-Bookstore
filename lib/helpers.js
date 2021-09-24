const path = require('path');

exports.getExtension = (filename) => {
    var ext = path.extname(filename||'').split('.');
    return ext[ext.length - 1];
};

exports.imageFilter = function(filename) {
    // Accept images only
    if (filename.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        console.log("pass");
        return true;
    }
    console.log("not pass");
    return false;
};

