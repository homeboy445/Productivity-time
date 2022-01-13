const fs = require("fs");
const path = require("path");
const { getLocalData } = require(path.join(__dirname, "DataParser.js"));
const DeleteTask = (task) => {
  const data_array = getLocalData();
  for (var i = 0; i < data_array.length; i++) {
    if (data_array[i].name === task) {
      id = data_array[i].id;
      data_array.splice(i, 1);
    }
  }
  return fs.writeFileSync(
    path.join(__dirname, "..", "..", "TaskList.json"),
    JSON.stringify(data_array),
    (e, data) => {
      return;
    }
  );
};

module.exports = {
  DeleteTask,
};
