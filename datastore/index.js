const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require('bluebird');
// const fs = Promise.promisifyAll(require('fs'));
var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId( (err, id) => {
    fs.writeFile(`${exports.dataDir}/${id}.txt`, text, (err) => {
      if (err) {
        callback(err);
      } else {
        callback(null, { id, text });
      }
    });
  });
};

exports.readAll = () => {
  var path = exports.dataDir;
  var data = [];
  var filenameArr = [];
  Promise.promisify(fs.readdir)(path)
    .then( (filenames) => {
      return Promise.all(filenames.map((filename) => {
        filenameArr.push(filename.split('.')[0]);
        return Promise.promisify(fs.readFile)(`${path}/${filename}`, 'utf8');
      })).then( (fileContents) => {
        for (var ind in fileContents) {
          data.push({ id: filenameArr[ind], text: fileContents[ind]});
        }
        //console.log('data', data);
        return data;
      });
    })
    .catch((err, data) => {
      console.log('Error', err);
      return null;
    });


  // fs.readdir(path, (err, files) => {
  //   if (err) {
  //     console.log('No files');
  //     callback(null, []);
  //   } else {
  //     for (var i = 0; i < files.length; i++) {
  //       var tempID = files[i].split('.')[0];
  //       var tempText = files[i].split('.')[0];
  //       data.push({id: tempID, text: tempText});
  //     }
  //     callback(null, data);
  //   }
  // });
};

exports.readOne = (id, callback) => {
  fs.readFile(`${exports.dataDir}/${id}.txt`, 'utf8', (err, data) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback(null, {id: id, text: data });
    }
  });
};

exports.update = (id, text, callback) => {
  fs.readFile(`${exports.dataDir}/${id}.txt`, 'utf8', (err, data) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      fs.writeFile(`${exports.dataDir}/${id}.txt`, text, (err, data) =>{
        if (err) {
          callback(new Error(`No item with id: ${id}`));
        } else {
          callback(null, {id: id, text: text});
        }
      });
    }
  });
};

exports.delete = (id, callback) => {
  fs.unlink(`${exports.dataDir}/${id}.txt`, (err) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback();
    }
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
