const paths = [
  { path: "/api/auth", router: require("../routes/auth") },
  { path: "/api/man", router: require("../routes/admin") },
  { path: "/api/uploads", router: require("../routes/upload") },
  { path: "/api/guest", router: require("../routes/guest") },
  { path: "/api/test", router: require("../routes/test") },
];

module.exports = { paths };
