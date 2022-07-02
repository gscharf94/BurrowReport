"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const index_js_1 = require("./routes/index.js");
const viewJobs_js_1 = require("./routes/viewJobs.js");
const viewProduction_js_1 = require("./routes/viewProduction.js");
const inputProduction_js_1 = require("./routes/inputProduction.js");
const inputDataPOST_js_1 = require("./routes/inputDataPOST.js");
const app = (0, express_1.default)();
const PORT = 3000;
app.locals.basedir = "/";
app.set('view engine', 'pug');
app.set('views', `${process.cwd()}/views`);
app.use(express_1.default.static('public'));
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
app.use('/', index_js_1.router);
app.use('/viewJobs', viewJobs_js_1.router);
app.use('/inputProduction', inputProduction_js_1.router);
app.use('/viewProduction', viewProduction_js_1.router);
app.use('/inputData', inputDataPOST_js_1.router);
app.listen(PORT, () => {
    console.log(`listening @ http://localhost:3000`);
});
