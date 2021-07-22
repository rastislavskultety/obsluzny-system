import stripJsonComments from 'strip-json-comments';
import path from 'path';
import fs from 'fs';

const configFileName = process.env.CONFIG_FILE || 'config.local.jsonc';
const configPath = path.resolve(__dirname, './config/' + configFileName);

// tslint:disable-next-line:no-console
console.log('Loading configuration from ' + configPath);

const configuration = JSON.parse(stripJsonComments(fs.readFileSync(configPath).toString()));

export default configuration;
