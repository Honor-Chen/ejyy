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

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    page_num: number;
    page_size: number;
}

const PcContractCategoryListAction = <Action>{
    router: {
        path: '/contract/category_list',
        method: 'post',
        authRequired: true,
        roles: [ROLE.HTGL]
    },
    validator: {
        body: [
            {
                name: 'page_num',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'page_size',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size } = <RequestBody>ctx.request.body;

        const list = await ctx.model
            .from('ejyy_contract_category')
            .leftJoin(
                'ejyy_property_company_user',
                'ejyy_property_company_user.id',
                'ejyy_contract_category.created_by'
            )
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ejyy_contract_category.id'))
            .select(
                'ejyy_contract_category.id',
                'ejyy_contract_category.name',
                'ejyy_contract_category.description',
                'ejyy_contract_category.created_at',
                'ejyy_contract_category.created_by',
                'ejyy_property_company_user.real_name'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ejyy_contract_category.id', 'desc');

        const [res] = await ctx.model.select(ctx.model.raw('found_rows() AS total'));

        ctx.body = {
            code: SUCCESS,
            data: {
                list,
                total: (res as any).total,
                page_amount: Math.ceil((res as any).total / page_size),
                page_num,
                page_size
            }
        };
    }
};

export default PcContractCategoryListAction;
