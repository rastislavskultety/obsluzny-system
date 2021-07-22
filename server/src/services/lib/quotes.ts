/*
 * Databáza citátov známych osobností
 */

import fs from 'fs';
import path from 'path';

/*
 * Informácie o citáte
 */
export interface Quote {
  quote: string, // citát
  author: string, // autor
  genre: string // kategória/druh citátu
}

// Cesta k json súboru obsahujúcemu citáty
const dataPath = path.resolve(__dirname, '../../data/quotes.json');

// Asynchrónne načítanie citátov
const quotesData: Promise<Quote[]> = new Promise((resolve, reject) => {
  fs.readFile(dataPath, (err, data) => {
    if (err) {
      // tslint:disable-next-line:no-console
      console.error('Cannot read data file ', dataPath, ': ', err);
      reject(err);
    }

    try {
      const result = JSON.parse(data.toString());
      resolve(result);
    } catch (err) {
      // tslint:disable-next-line:no-console
      console.error('Cannot parse data file ', dataPath, ': ', err);
      reject(err);
    }
  })
});

/*
 * Zísanie poľa citátov náhodne vybraných z databázy
 *
 * Mohlo by byť spravené synchrónne, ale ak by sa databáza previedla napríklad na sql server,
 * tak by bolo asynchrónne spracovanie potrebné.
 */
export async function fetchRandomQuotes(count: number): Promise<Quote[]> {
  const data = await quotesData;
  const result = [];
  for (let i = 0; i < count; ++i) {
    const index = Math.floor(Math.random() * data.length);
    result.push(data[index]);
  }

  return result;
}





