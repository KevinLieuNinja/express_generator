const cors = require("cors");

const whitelist = ["http://localhost:300", "https://localhost:3443"];
const corsOptionDelegate = (req, callback) => {
  let corsOption;
  console.log(req.header("Origin"));
  if (whitelist.indexOf(req.header("Origin")) !== -1) {
    corsOption = { origin: true };
  } else {
    corsOption = { origin: false };
  }
  callback(null, corsOption);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionDelegate);
