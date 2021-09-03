const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const { WSAEINPROGRESS } = require("constants");
if (require("electron-squirrel-startup")) {
  app.quit();
}

let mainWindow,
  AddTaskWindow,
  AskTaskWindow,
  TaskDoneWindow,
  CompletedTaskWindow;

let StatWindow, BreakWindow, HelpPage, DevNotes, WipeDataWindow;

let TimeConvertorWindow;

const WritePreferences = (Pref) => {
  fs.writeFile(path.join(__dirname, "Preferences.txt"), Pref, () => {
    return;
  });
};

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, "public", "icon.ico"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "public", "html", "index.html"));

  const MainMenu = Menu.buildFromTemplate(MainMenuTemplate);
  Menu.setApplicationMenu(MainMenu);
  mainWindow.on("closed", () => {
    app.quit();
  });
};

ipcMain.on("openWindow", (e, item) => {
  AddTask();
});

ipcMain.on("item:add", (e, obj) => {
  fs.appendFile(
    path.join(__dirname, "TaskText.txt"),
    `([${new Date().toLocaleDateString()}]|${Date.now()}+${obj.value}+${
      obj.priority
    })*`,
    (err) => {
      mainWindow.webContents.send("item:add", obj);
      AddTaskWindow.close();
    }
  );
});

ipcMain.on("selected:task", (e, data) => {
  mainWindow.webContents.send("selected:task", data);
  AskTaskWindow.close();
});

const AddTask = () => {
  AddTaskWindow = new BrowserWindow({
    width: 400,
    height: 300,
    icon: path.join(__dirname + "/public/", "icon.ico"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    autoHideMenuBar: true,
  });
  AddTaskWindow.loadFile(path.join(__dirname + "/public/html", "Addtask.html"));
  AddTaskWindow.on("close", () => {
    AddTaskWindow = null; //FOR ENSURING PROPER GARBAGE COLLECTION
  });
};

const AskTaskPrompt = (data) => {
  AskTaskWindow = new BrowserWindow({
    width: 350,
    height: 250,
    icon: path.join(__dirname + "/public/", "icon.ico"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    autoHideMenuBar: true,
  });
  AskTaskWindow.loadFile(path.join(__dirname + "/public/html", "AskTask.html"));
  AskTaskWindow.on("close", () => {
    mainWindow.webContents.send("selected:task", { task: null, status: false });
    AskTaskWindow = null;
  });
};

const TaskDonePrompt = () => {
  TaskDoneWindow = new BrowserWindow({
    height: 200,
    width: 300,
    icon: path.join(__dirname + "/public/", "icon.ico"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    autoHideMenuBar: true,
  });
  TaskDoneWindow.loadFile(
    path.join(__dirname + "/public/html", "TaskDone.html")
  );

  TaskDoneWindow.on("close", () => {
    mainWindow.webContents.send("task:verdict", { task: null, status: false });
    TaskDoneWindow = null;
  });
};

const CompleteTaskPrompt = () => {
  CompletedTaskWindow = new BrowserWindow({
    width: 400,
    height: 400,
    icon: path.join(__dirname + "/public/", "icon.ico"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    autoHideMenuBar: true,
  });
  CompletedTaskWindow.loadFile(
    path.join(__dirname + "/public/html", "CompletedTasks.html")
  );
  CompletedTaskWindow.on("close", () => {
    CompletedTaskWindow = null;
  });
};

ipcMain.on("open-TaskDone-window", (e, data) => {
  TaskDonePrompt();
});

ipcMain.on("open-AskTask-Window", (e, data) => {
  AskTaskPrompt(data);
});

ipcMain.on("task:verdict", (e, data) => {
  mainWindow.webContents.send("task:verdict", data);
  TaskDoneWindow.close();
});

const StatWindowPrompt = (data) => {
  StatWindow = new BrowserWindow({
    height: 500,
    width: 500,
    icon: path.join(__dirname + "/public/", "icon.ico"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    autoHideMenuBar: true,
  });
  global.custom = () => {
    return ThemeManager;
  };
  StatWindow.loadFile(
    path.join(__dirname + "/public/html", "TaskStatistics.html")
  );

  StatWindow.on("close", () => {
    StatWindow = null;
  });
};

const BreakWindowPrompt = () => {
  BreakWindow = new BrowserWindow({
    height: 300,
    width: 400,
    icon: path.join(__dirname + "/public/", "icon.ico"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    autoHideMenuBar: true,
  });
  BreakWindow.loadFile(
    path.join(__dirname + "/public/html", "BreakReminder.html")
  );
  BreakWindow.on("close", () => {
    BreakWindow = null;
  });
};

ipcMain.on("Break:time", (e, data) => {
  BreakWindowPrompt();
  setTimeout(() => {
    if (BreakWindow != null) {
      BreakWindow.close();
    }
  }, 15000);
});

const HelpPagePrompt = () => {
  HelpPage = new BrowserWindow({
    height: 600,
    width: 800,
    icon: path.join(__dirname + "/public/", "icon.ico"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    autoHideMenuBar: true,
  });
  HelpPage.loadFile(path.join(__dirname + "/public/html", "Help.html"));
  HelpPage.on("close", () => {
    HelpPage = null;
  });
};

const Send_Event = (theme) => {
  WritePreferences(theme);
  if (mainWindow != null) {
    mainWindow.webContents.send("theme-change", theme);
  }
  if (AddTaskWindow != null) {
    AddTaskWindow.webContents.send("theme-change", theme);
  }
  if (AskTaskWindow != null) {
    AskTaskWindow.webContents.send("theme-change", theme);
  }
  if (StatWindow != null) {
    StatWindow.webContents.send("theme-change", theme);
  }
  if (BreakWindow != null) {
    BreakWindow.webContents.send("theme-change", theme);
  }
  if (TaskDoneWindow != null) {
    TaskDoneWindow.webContents.send("theme-change", theme);
  }
  if (CompletedTaskWindow != null) {
    CompletedTaskWindow.webContents.send("theme-change", theme);
  }
};

const DevNotesPrompt = () => {
  DevNotes = new BrowserWindow({
    height: 500,
    width: 600,
    icon: path.join(__dirname + "/public/", "icon.ico"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    autoHideMenuBar: true,
  });
  DevNotes.loadFile(path.join(__dirname + "/public/html", "DevNotes.html"));
  DevNotes.on("close", () => {
    DevNotes = null;
  });
};

const WipeDataWindowPrompt = () => {
  WipeDataWindow = new BrowserWindow({
    height: 300,
    width: 400,
    icon: path.join(__dirname + "/public/", "icon.ico"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    autoHideMenuBar: true,
  });
  WipeDataWindow.loadFile(
    path.join(__dirname + "/public/html", "WipeData.html")
  );
  WipeDataWindow.webContents.openDevTools();
  WipeDataWindow.on("close", () => {
    WipeDataWindow = null;
  });
};

const TimeConvertorWindowPrompt = () => {
  TimeConvertorWindow = new BrowserWindow({
    height: 300,
    width: 400,
    icon: path.join(__dirname + "/public/", "icon.ico"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    autoHideMenuBar: true,
  });
  TimeConvertorWindow.loadFile(
    path.join(__dirname + "/public/html", "TimeConvertor.html")
  );
  TimeConvertorWindow.on("close", () => {
    TimeConvertorWindow = null;
  });
};

ipcMain.on("Close-Wipe-Win", (e, data) => {
  WipeDataWindow.close();
});

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

const MainMenuTemplate = [
  {
    label: "File",
    submenu: [
      {
        label: "Add Task",
        click() {
          AddTask();
        },
      },
      {
        label: "Wipe Data",
        click() {
          WipeDataWindowPrompt();
        },
      },
      {
        label: "Time Convertor",
        click() {
          TimeConvertorWindowPrompt();
        },
      },
      {
        label: "Exit",
        accelarator: "Ctrl+Q",
        click() {
          app.quit();
        },
      },
    ],
  },
];

MainMenuTemplate.push(
  {
    label: "Tools",
    submenu: [
      {
        label: "Completed Tasks",
        click() {
          CompleteTaskPrompt();
        },
      },
      {
        label: "Task Stat",
        click() {
          StatWindowPrompt();
        },
      },
      {
        role: "reload",
      },
    ],
  },
  {
    label: "View",
    submenu: [
      {
        label: "Themes",
        submenu: [
          {
            label: "Simplx-Light",
            click() {
              Send_Event("Simplx-Light");
            },
          },
          {
            label: "Simplx-Dark",
            click() {
              Send_Event("Simplx-Dark");
            },
          },
          {
            label: "Party-Tonight",
            click() {
              Send_Event("Party-Tonight");
            },
          },
          {
            label: "Vintage-Villager",
            click() {
              Send_Event("Vintage-Villager");
            },
          },
          {
            label: "BlueOcean",
            click() {
              Send_Event("BlueOcean");
            },
          },
        ],
      },
    ],
  },
  {
    label: "About",
    submenu: [
      {
        label: "Help",
        click() {
          HelpPagePrompt();
        },
      },
      {
        label: "Dev Notes",
        click() {
          DevNotesPrompt();
        },
      },
    ],
  }
);
