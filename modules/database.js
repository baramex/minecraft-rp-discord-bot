const countries = require("lowdb")(new (require("lowdb/adapters/FileSync"))("./databases/countries.json"));
countries.defaults({ countries: [] }).write();

const companies = require("lowdb")(new (require("lowdb/adapters/FileSync"))("./databases/companies.json"));
companies.defaults({ companies: [] }).write();

module.exports = { countries };