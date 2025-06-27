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
  name: 'act_task_condition',
  title: '条件配置表',
  fields: [
    {
      type: 'integer',
      name: 'id',
      title: '条件 ID',
      primaryKey: true,
      autoIncrement: true,
    },
    {
      type: 'string',
      name: 'operator',
      title: '条件类型',
      interface: 'select',
      uiSchema: {
        enum: ['Equal', 'NotEqual', 'GreaterThan', 'GreaterThanOrEqual', 'LessThan', 'LessThanOrEqual', 'In', 'NotIn'],
      },
    },
    {
      type: 'string',
      name: 'conditionType',
      title: '条件属性',
      interface: 'input',
    },
    {
      type: 'string',
      name: 'value',
      title: '条件值',
      interface: 'input',
    },
    {
      type: 'string',
      name: 'desc',
      title: '描述',
      interface: 'textarea',
    },
  ],
});
