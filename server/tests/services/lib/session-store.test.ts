import { SessionStore } from '../../../src/services/lib/session-store'
import { v4 as uuidv4 } from 'uuid';
import { expect } from 'chai';
import { RedisStore } from '../../../src/services/lib/redis-store';

interface Data {
  username: string;
}

describe('session-store.ts', () => {


  let redisStore: RedisStore;

  before(async () => {
    redisStore = new RedisStore();
    await redisStore.call('flushall');
  });

  after(() => {
    redisStore.call('quit');
  })

  it('Vytvorenie session store', () => {
    expect(new SessionStore<Data>(redisStore)).to.be.an('object');
  });

  it('Overenie neexistujúceho sid', async () => {
    const s = new SessionStore<Data>(redisStore);
    const randomSid = uuidv4();

    expect(await s.sessionExists(randomSid)).to.eq(false);

    let error: any;
    try {
      await s.getSessionData(randomSid);
    } catch (err) {
      error = err;
    }

    expect(error).to.be.an('Error');
    expect(error.message).to.equal('Session not found');
  });


  it('Overenie existujúceho sid', async () => {
    const username = 'Ján Novák';
    const s = new SessionStore<Data>(redisStore);

    const sid = await s.createSession({ username });
    expect(await s.sessionExists(sid)).to.eq(true);
    expect(await s.getSessionData(sid)).to.deep.equal({ username });

    await s.destroySession(sid);
  });


  it('Zmazanie relácie', async () => {
    const username = 'Ján Novák';
    const s = new SessionStore<Data>(redisStore);

    const sid = await s.createSession({ username });
    expect(await s.sessionExists(sid)).to.eq(true);
    await s.destroySession(sid);
    expect(await s.sessionExists(sid)).to.eq(false);
  });

  it('Zmazanie neexistujúcej relácie nevráti chybu', async () => {
    const s = new SessionStore<Data>(redisStore);
    const randomSid = uuidv4();

    await s.destroySession(randomSid);
  });

  it('Počet aktívnych relácií', async () => {
    const sids = [];
    const N = 5;
    const s = new SessionStore<Data>(redisStore);

    expect(await s.count()).to.eql(0);

    for (let i = 0; i < N; ++i) {
      sids.push(await s.createSession({ username: `user${i}` }));
      expect(await s.count()).to.eql(i + 1);
    }
    for (let i = 0; i < N; ++i) {
      await s.destroySession(sids[i]);
      expect(await s.count()).to.eql(N - i - 1);
    }

  });
});
