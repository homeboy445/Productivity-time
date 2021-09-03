const fs = require("fs");
const getPreferences = () => {
  let theme1 = fs
    .readFileSync(path.join(__dirname, "..", "..", "Preferences.txt"))
    .toString();
  return theme1;
};

module.exports = { getPreferences };
