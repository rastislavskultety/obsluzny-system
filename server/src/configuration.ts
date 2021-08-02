/*
 * Načítanie konfigurácie aplikácie z konfiguračného servera
 *
 * Konfigurácia je uložená v .json súbore, môže obsahovať komentáre a poznámky
 */

import stripJsonComments from 'strip-json-comments';
import path from 'path';
import fs from 'fs';
import debug from 'debug';

const debugFile = debug('file');

const configFileName = process.env.CONFIG_FILE || 'config.local.jsonc';
const configPath = path.resolve(__dirname, './config/' + configFileName);

debugFile('Loading configuration from %o', configPath);

/*
 * Synchrónne načítanie súbora a parsovanie
 *
 * Ak vznikne chyba, tak je ukončený celý process, aplikácia nemôže fungovať bez konfiguračného súboru
 */
const configuration = JSON.parse(stripJsonComments(fs.readFileSync(configPath).toString()));

export default configuration;
