var ret_obj = (data) => {
  var obj1 = data.split("|");
  var date_str = obj1[0],
    task_str = obj1[1];
  var date = "",
    id = "",
    task = "",
    priority = "",
    turn = 1,
    str = "";
  for (var i = 2; i < date_str.length - 1; i++) {
    date += date_str[i];
  }
  for (var j = 0; j < task_str.length; j++) {
    if (task_str[j] == "+") {
      switch (turn) {
        case 1:
          id = str;
          break;
        case 2:
          task = str;
          break;
        case 3:
          priority = str;
          break;
      }
      turn++;
      str = "";
    } else {
      if (task_str[j] != ")") {
        str += task_str[j];
      }
    }
  }
  priority = str;
  var obj = {
    id: id,
    date: date,
    task: task,
    priority: priority,
  };
  return obj;
};

const Remove_Duplicate = (taskobj) => {
  var new_obj = [];
  var Num_Hash = new Map();
  for (var i = 0; i < taskobj.length; i++) {
    for (var j = i + 1; j < taskobj.length; j++) {
      if (taskobj[i].task.toLowerCase() === taskobj[j].task.toLowerCase()) {
        Num_Hash.set(j, 1);
      }
    }
    if (Num_Hash.get(i)) {
      continue;
    }
    new_obj.push(taskobj[i]);
  }
  return new_obj;
};

var getData = () => {
  var data = fs.readFileSync(path.join(__dirname,"..","..","TaskText.txt")).toString();
  var Task_Array = data.split("*");
  var Done = [];
  Task_Array.map((item) => {
    if (item.trim()) {
      Done.push(ret_obj(item));
    }
  });
  var obj = Remove_Duplicate(Done);
  return obj;
};

const Ret_Sec = (time) => {
  var a = time.split(":");
  var seconds = +a[0] * 60 * 60 + +a[1] * 60 + +a[2];
  return seconds;
};
const CalcSecond = (item) => {
  var tot_sec = 0;
  item.map((it) => {
    tot_sec += Ret_Sec(it.time_taken);
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
        time_taken: Ret_Sec(value[0].time_taken),
      });
    }
  }
  return [New_Obj, Stat_Obj];
};

const ParseCompleteData = (object) => {
  var obj_split = object.split("|");
  var tsk_split = obj_split[1].split("=");
  var date = "",
    task = "",
    time_taken = "";
  for (var i = 1; i < obj_split[0].length - 1; i++) {
    date += obj_split[0][i];
  }
  for (var i = 1; i < tsk_split[0].length; i++) {
    task += tsk_split[0][i];
  }
  for (var j = 1; j < tsk_split[1].length - 2; j++) {
    time_taken += tsk_split[1][j];
  }
  var obj = {
    date: date,
    task: task,
    time_taken: time_taken,
  };
  return obj;
};
const GetCompleteData = () => {
  var data = fs
    .readFileSync(path.join(__dirname,'..','..',"Completed.txt"))
    .toString()
    .split("\n");
  var comp = [];
  data.map((item) => {
    if (item.trim()) {
      comp.push(ParseCompleteData(item));
    }
  });
  var Processed_Data = Join_Similar(comp);
  return Processed_Data;
};
module.exports = {
  getData,
  GetCompleteData,
};
