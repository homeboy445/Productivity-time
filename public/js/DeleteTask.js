const fs = require("fs");
const path = require("path");
const { getData } = require(path.join(
  __dirname + "/public/js",
  "DataParser.js"
));
const DeleteTask = (task) => {
  var obj = getData();
  var write_string = "",
    id;
  for (var i = 0; i < obj.length; i++) {
    if (obj[i].task == task) {
      id = obj[i].id;
      obj.splice(i, 1);
    }
  }
  obj.map((item) => {
    write_string += `([${item.date}]|${item.id}+${item.task}+${item.priority})*`;
  });
  fs.writeFile(path.join(__dirname, "TaskText.txt"), write_string, (e) => {
    return;
  });
};
module.exports = {
  DeleteTask,
};
