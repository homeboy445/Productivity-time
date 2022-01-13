const getData = () => {
  var data = fs
    .readFileSync(path.join(__dirname, "..", "..", "TaskList.json"))
    .toString();
  return JSON.parse(data);
};

const get_seconds = (time) => {
  var a = time.split(":");
  var seconds = +a[0] * 60 * 60 + +a[1] * 60 + +a[2];
  return seconds;
};

const CalcSecond = (item) => {
  var tot_sec = 0;
  item.map((it) => {
    tot_sec += get_seconds(it.time_taken);
  });
  var hrs = Math.floor(tot_sec / 3600);
  var min = Math.floor((tot_sec - hrs * 3600) / 60);
  var sec = tot_sec - hrs * 3600 - min * 60;
  var time_tk = `${hrs < 10 ? "0" + hrs : hrs}:${min < 10 ? "0" + min : min}:${
    sec < 10 ? "0" + sec : sec
  }`;
  return [
    {
      date: item[0].date,
      task: item[0].task,
      time_taken: time_tk,
    },
    {
      date: item[0].date,
      task: item[0].task,
      time_taken: tot_sec,
    },
  ];
};

const Join_Similar = (data) => {
  var similar = {},
    New_Obj = [],
    Stat_Obj = [];
  data.map((item) => {
    if (typeof similar[item.task] == undefined || similar[item.task] == null) {
      similar[item.task] = [item];
    } else {
      similar[item.task].push(item);
    }
  });
  for (const [key, value] of Object.entries(similar)) {
    if (value.length > 1) {
      var t = CalcSecond(value);
      New_Obj.push(t[0]);
      Stat_Obj.push(t[1]);
    } else {
      New_Obj.push(value[0]);
      Stat_Obj.push({
        date: value[0].date,
        task: value[0].task,
        time_taken: get_seconds(value[0].time_taken),
      });
    }
  }
  return [New_Obj, Stat_Obj];
};

const GetCompleteData = (fs = require('fs'), path = require('path')) => {
  let data = fs
    .readFileSync(path.join(__dirname, "..", "..", "Completed.json"))
    .toString();
  data = JSON.parse(data); //TODO: Continue fixing this...
  if (typeof data !== "object") {
    return [];
  }
  return data;
};

const appendTask = (data, fs = require("fs"), fileName = "TaskList.json") => {
  let masterData = fs
    .readFileSync(path.join(__dirname, "..", "..", fileName))
    .toString();
  masterData = JSON.parse(masterData);
  if (typeof masterData === "string") {
    masterData = [];
  }
  masterData.push(data);
  return fs.writeFileSync(
    path.join(__dirname, "..", "..", fileName),
    JSON.stringify(masterData),
    (e, data) => {
      return;
    }
  );
};

const appendCompletedTasks = (data, fs = require("fs")) => {
  return appendTask(data, fs, "Completed.json");
};

module.exports = {
  getLocalData: getData,
  GetCompleteData,
  saveTask: appendTask,
  appendCompletedTasks,
};
