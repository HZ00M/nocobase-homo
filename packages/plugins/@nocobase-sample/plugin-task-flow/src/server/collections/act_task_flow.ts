/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { defineCollection } from '@nocobase/database';

export default defineCollection({
  name: 'act_task_flow',
  title: '任务流程',
  fields: [
    {
      type: 'uid',
      name: 'id',
      primaryKey: true,
    },
    {
      type: 'string',
      name: 'title',
      title: '流程名称',
      required: true,
    },
    {
      type: 'text',
      name: 'description',
      title: '流程描述',
    },
    {
      type: 'json',
      name: 'nodes',
      title: '任务节点数据',
      // 示例值：[ { id: 'node-1', type: 'stacked', data: {...}, position: {...} }, ... ]
    },
    {
      type: 'json',
      name: 'edges',
      title: '任务连线数据',
      // 示例值：[ { id: 'edge-1', source: 'node-1', target: 'node-2' }, ... ]
    },
  ],
});
