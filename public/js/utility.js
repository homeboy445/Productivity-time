const fs = require("fs");
const getPreferences = () => {
  let theme1 = fs
    .readFileSync(path.join(__dirname, "..", "..", "Preferences.json"))
    .toString();
  return JSON.parse(theme1).theme;
};

module.exports = { getPreferences };
