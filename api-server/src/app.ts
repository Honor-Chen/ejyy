/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import 'module-alias/register'; // !：插件：设置模块别名
import Koa from 'koa';
import KoaRouter from 'koa-router'; // 路由中间件
import KoaBodyMiddleware from 'koa-body'; // 解析 body parse
import KoaSessionMilddleware from 'koa-session';
import KoaLogMiddleware from 'koa-logger';
import http from 'http';
import cwlog from 'chowa-log'; // 日志提示信息的级别

import RedisSessionStore from '~/store/redis-session'; // 自己实现的 验证码 过期逻辑

import MysqlSessionStore from '~/store/mysql-session';
import config from '~/config';
import * as ScheduleJob from '~/schedule';

import MpModule from '~/module/mp';
import PcModule from '~/module/pc'; // 获取到 PC 下的所有路由信息
import NotifyModule from '~/module/notify';
import OaModule from '~/module/oa';

import wss from '~/wss';
import * as redisService from '~/service/redis';

import ModelMiddleware from '~/middleware/model';
import IpMiddleware from '~/middleware/ip';
import HeaderMiddleware from '~/middleware/header';
import WatcherMiddleware from '~/middleware/watcher';
import InitMiddleware from '~/middleware/init';

const app = new Koa();
const router = new KoaRouter();
const server = http.createServer(app.callback());

cwlog.setProject(`${config.name}-${process.pid}`);
cwlog.displayDate();

// schedule
ScheduleJob.run();

// modules
MpModule(router);
PcModule(router);
NotifyModule(router);
OaModule(router);

// WebSocket
wss.init(server);

// for socket
redisService.subscribe();

console.log('***************************', { ...config.session }, '***************************');

app.use(KoaBodyMiddleware({ multipart: true }))
    .use(
        KoaLogMiddleware({
            transporter: str => {
                cwlog.log(`${str}`);
            }
        })
    )
    .use(
        KoaSessionMilddleware(
            /* {
                store: new MysqlSessionStore(),
                ...config.session // { key: 'ejyy:session', maxAge: 1800000, signed: false }
            }, */
            {
                store: new RedisSessionStore(),
                ...config.session // { key: 'ejyy:session', maxAge: 1800000, signed: false }
            },
            app
        )
    )
    .use(ModelMiddleware())
    .use(IpMiddleware())
    .use(HeaderMiddleware())
    .use(InitMiddleware())
    .use(router.routes())
    .use(WatcherMiddleware());

const port = process.env.port ? parseInt(process.env.port, 10) : config.server.port;

server.listen(port, '0.0.0.0', () => {
    cwlog.success(`${config.name} server running on port ${port}，work process ${process.pid}`);
});
