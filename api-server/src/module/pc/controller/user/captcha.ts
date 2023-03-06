/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import svgCaptcha from 'svg-captcha';
import config from '~/config';

const PcUserCaptchaAction = <Action>{
    router: {
        path: '/user/captcha',
        method: 'get',
        authRequired: false
    },

    response: async ctx => {
        const captcha = svgCaptcha.create({
            size: 4, // 验证码个数
            ignoreChars: '0o1il', // 验证码中排除的字符
            noise: 1, // 干扰的线条数量
            color: true, // 验证码的字符是否有颜色，默认没有，如果设定了背景，则默认有
            background: '#fff',
            height: 72,
            width: 240,
            fontSize: 66
        });

        // console.log('验证码 - 出生地：', captcha.text.toLowerCase());
        ctx.session.loginCaptcha = captcha.text.toLowerCase();

        ctx.body = {
            code: SUCCESS,
            data: {
                img: `data:image/svg+xml;base64,${Buffer.from(captcha.data).toString('base64')}`,
                expire: config.session.maxAge
            }
        };
    }
};

export default PcUserCaptchaAction;
