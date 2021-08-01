import * as Quotes from '../../../src/services/lib/quotes';
import { expect } from 'chai';

describe('quotes.ts', () => {
  it('Získanie náhodne vybraných citátov', async () => {
    const quotes = await Quotes.fetchRandomQuotes(3);

    expect(quotes).to.be.an('array');
    expect(quotes.length).to.eq(3);
    quotes.forEach(quote => {
      expect(quote).to.be.an('object');
      expect(quote).to.have.property('quote');
      expect(quote).to.have.property('author');
      expect(quote).to.have.property('genre');
    });
  });
})
