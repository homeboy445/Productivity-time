const { ipcRenderer } = require("electron");
const hrs = document.getElementById("hrs");
const min = document.getElementById("min");
const sec = document.getElementById("sec");
const start = document.getElementById("start");
const stop = document.getElementById("stop");
const reset = document.getElementById("reset");
const resume = document.createElement("button");
const buttons = document.querySelector(".butns");
const fs = require("fs");
const path = require("path");
const { getLocalData, saveTask, appendCompletedTasks } = require(path.join(
  __dirname,
  "..",
  "js",
  "DataParser.js"
));
const { DeleteTask } = require(path.join(
  __dirname,
  "..",
  "js",
  "DeleteTask.js"
));
const { getPreferences } = require(path.join(
  __dirname,
  "..",
  "js",
  "Utility.js"
));
var interval_start = 0,
  interval_resume = 0,
  flag = false,
  current_task = null;
var resume_tracker = 0;
var Done = [],
  counter = 0;
resume.innerText = "Resume";

const reset_timer = () => {
  hrs.innerText = "00";
  min.innerText = "00";
  sec.innerText = "00";
};

const Resume_Timer = () => {
  clearInterval(interval_start);
  clearInterval(interval_resume);
  resume_tracker = resume_tracker === 0 ? 0 : --resume_tracker;
  reset.disabled = false;
  flag = true;
  resume.addEventListener("click", () => {
    if (resume_tracker === 0) {
      interval_resume = setInterval(() => {
        timerIncrementor("Resume");
      }, 1000);
      resume_tracker++;
    }
    reset.disabled = true;
    start.disabled = true;
    resume.remove();
  });
  buttons.appendChild(resume);
};

document.querySelector(".date").innerText = new Date().toLocaleDateString();
let timer = 0;
const timerIncrementor = (info) => {
  timer++;
  sec.innerText = (timer % 60 < 10 ? "0" : "") + (timer % 60);
  var mn = Math.floor(timer / 60) % 60;
  min.innerText = (mn < 10 ? "0" : "") + mn;
  var hr = Math.floor(timer / (60 * 60)) % 60;
  hrs.innerText = (hr < 10 ? "0" : "") + hr;
  if ((timer / 60) % 45 === 0 && timer > 60) {
    ipcRenderer.send("Break:time", "break");
    Resume_Timer();
  }
};

current_task = () => {
  return new Promise((resolve) => {
    ipcRenderer.on("selected:task", (e, data) => {
      resolve(data);
    });
  });
};

start.addEventListener("click", async () => {
  ipcRenderer.send("open-AskTask-Window", "open");
  var cur = document.getElementById("current");
  var cur_task = await current_task();
  if (!cur_task.status || typeof cur_task === undefined) {
    timer = 0;
    return reset_timer();
  }
  var color = (task) => {
    var found = -1;
    for (var i = 0; i < Done.length; i++) {
      if (Done[i].task === task) {
        found = Done[i].priority;
        break;
      }
    }
    return found != -1
      ? found === "high"
        ? "red"
        : found === "mid"
        ? "blue"
        : "yellow"
      : "white";
  };
  cur.style.color = color(cur_task.task);
  cur.innerText = cur_task.task;
  interval_start = setInterval(() => {
    timerIncrementor("Start");
  }, 1000);
  start.disabled = true;
  reset.disabled = true;
  flag = false;
});

stop.addEventListener("click", () => {
  if (timer > 0) {
    Resume_Timer();
  }
});
reset_timer();

const Task_Done_Prompt = () => {
  return new Promise((resolve) => {
    ipcRenderer.send("open-TaskDone-window", "open");
    ipcRenderer.on("task:verdict", (e, data) => {
      resolve(data);
    });
  });
};

reset.addEventListener("click", async () => {
  if (flag) {
    flag = false;
    var proceed = await Task_Done_Prompt();
    if (proceed.status) {
      resume.remove();
      var cur = document.getElementById("current");
      var completed_task,
        id = null;
      if (proceed.verdict === "Continue Project") {
        return;
      }
      start.disabled = false;
      timer = 0;
      for (var i = 0; i < Done.length; i++) {
        if (Done[i].name === cur.innerText) {
          completed_task = Done[i].name;
          id = id === null ? i : id;
          if (proceed.verdict !== "Continue later") {
            Done.splice(i, 1);
          }
        }
      }
      cur.innerText = "";
      const obj = {
        name: completed_task,
        completion_date: new Date().toLocaleDateString(),
        elapsed_time: `${hrs.innerText}:${min.innerText}:${sec.innerText}`,
      };
      appendCompletedTasks(obj, fs);
      if (proceed.verdict != "Continue later") {
        DeleteTask(completed_task);
        document.getElementById("tasklist").deleteRow(id + 1);
      }
      reset_timer();
    }
  }
});

const Manage_Theme = (theme) => {
  if (theme.length === 0) {
    theme = getPreferences();
  }
  var curBg = document.body;
  curBg.style.backgroundSize = "cover";
  curBg.style.backgroundRepeat = "no-repeat";
  curBg.style.color = "white";
  curBg.style.textShadow = "1px 1px 1px black";
  if (theme === "Simplx-Light") {
    curBg.style.background = "white";
    curBg.style.color = "black";
    curBg.style.textShadow = "none";
  }
  if (
    theme === "Simplx-Dark" ||
    theme.length === 0 ||
    typeof theme === undefined
  ) {
    curBg.style.background = "rgb(39, 40, 41)";
    curBg.style.color = "yellow";
  }
  if (theme === "Party-Tonight") {
    curBg.style.background = "#21D4FD";
    curBg.style.backgroundImage =
      "linear-gradient(19deg, #21D4FD 0%, #B721FF 100%)";
    curBg.style.textShadow = "2px 2px 2px black";
  }
  if (theme === "Vintage-Villager") {
    curBg.style.background = "#00DBDE";
    curBg.style.backgroundImage =
      "linear-gradient(90deg, #00DBDE 0%, #FC00FF 100%)";
  }
  if (theme === "BlueOcean") {
    curBg.style.background = "#0093E9";
    curBg.style.backgroundImage =
      "linear-gradient(160deg, #0093E9 0%, #80D0C7 100%)";
  }
};

const InitiateData = () => {
  Done = getLocalData();
  if (
    (Done ?? []).length === 0 ||
    typeof Done === "string" ||
    Done === null ||
    Done === undefined
  ) {
    return;
  }
  for (var i = counter; i < Done.length; i++) {
    AppendTask(Done[i] ?? {});
    counter++;
  }
};

//Reload Management!
document.addEventListener("DOMContentLoaded", () => {
  InitiateData();
});
// ipcRenderer.send('item')
ipcRenderer.on("item:add", (e, obj) => {
  saveTask(obj);
  InitiateData(obj);
});
Manage_Theme("");
//Add task functionality button
ipcRenderer.on("theme-change", (e, data) => {
  Manage_Theme(data);
});

const AddTask = document.getElementById("adtsk");
AddTask.addEventListener("click", () => {
  ipcRenderer.send("openWindow", "open");
});

const AppendTask = (obj) => {
  if (typeof obj !== "object") {
    return;
  }
  const tasklist = document.getElementById("tasklist");
  var tr = document.createElement("tr");
  var th1 = document.createElement("th");
  var th2 = document.createElement("th");
  th1.innerText = obj.name;
  th2.innerText = obj.priority;
  var color =
    obj.priority === "mid"
      ? "rgb(49, 214, 255)"
      : obj.priority === "high"
      ? "red"
      : "yellow";
  th1.style.background = color;
  th2.style.background = color;
  tr.appendChild(th1);
  tr.appendChild(th2);
  tasklist.appendChild(tr);
};
