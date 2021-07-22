"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strip_json_comments_1 = __importDefault(require("strip-json-comments"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const configFileName = process.env.CONFIG_FILE || 'config.local.jsonc';
const configPath = path_1.default.resolve(__dirname, './config/' + configFileName);
// tslint:disable-next-line:no-console
console.log('Loading configuration from ' + configPath);
const configuration = JSON.parse(strip_json_comments_1.default(fs_1.default.readFileSync(configPath).toString()));
exports.default = configuration;
//# sourceMappingURL=configuration.js.map