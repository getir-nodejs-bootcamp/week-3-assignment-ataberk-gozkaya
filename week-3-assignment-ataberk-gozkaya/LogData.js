//import file systems module
const fs = require('fs');

//method for writing logs to a file
module.exports = (file, data) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(file, data, {'flag':'a'}, err => {
            if(err) reject('couldnt write');
            resolve();
        });
    });
}
