var path = require('path');

exports.AdminLocalFolders = {
    "UploadLocal": path.join(__dirname, '../public/upload/'),
    "UploadPath": "/upload"
};

exports.getAdminLocalFolders = function () {
    var folders = exports.AdminLocalFolders, result = [];
    for (var key in folders) {
        if (Object.hasOwnProperty(key)) {
            result.push(folders[key]);
        }
    }

    return result;
};
