import { Session } from 'koa-session';
import Redis from 'ioredis';

const client = new Redis({
    port: 6379,
    host: '127.0.0.1',
    // username: 'auth',
    password: 'root'
});

client.on('error', err => {
    console.log('redis error...', err);
});
client.on('connect', () => {
    console.log('redis connected...');
});

export default class RedisSessionStore {
    async get(sid: string): Promise<Session> {
        const value = await client.get(sid);

        // console.log('get :>> ', sid, value);

        let session = <Session>null;

        if (value) {
            session = { loginCaptcha: value } as any;
        }
        return session;
    }

    async set(sid: string, session: Session, ttl: number) {
        // console.log('set :>> ', sid, session, ttl);
        await client.set(sid, session.loginCaptcha, 'EX', 30); // expire 单位：second
    }

    async destroy(sid: string) {
        client.del(sid);
    }
}
