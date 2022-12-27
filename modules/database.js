const countries = require("lowdb")(new (require("lowdb/adapters/FileSync"))("./databases/countries.json"));
countries.defaults({ countries: [] }).write();

module.exports = { countries };