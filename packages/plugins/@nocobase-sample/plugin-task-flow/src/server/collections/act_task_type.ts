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
  name: 'act_task_type',
  title: '任务节点类型',
  fields: [
    {
      type: 'string',
      name: 'value',
      title: '类型值',
      required: true,
      unique: true,
      index: true,
    },
    {
      type: 'string',
      name: 'type',
      title: '分组类型',
    },
    {
      type: 'string',
      name: 'desc',
      title: '描述',
    },
    {
      type: 'string',
      name: 'mark',
      title: '自定义描述',
      uiSchema: {
        type: 'textarea',
      },
    },
    {
      type: 'string',
      name: 'className',
      title: 'Java类名',
      required: true,
    },
    {
      type: 'json',
      name: 'inheritance',
      title: '继承链',
      defaultValue: [],
    },
    {
      type: 'json',
      name: 'include',
      title: '包含类型',
    },
    {
      type: 'json',
      name: 'exclude',
      title: '排除类型',
    },
    {
      type: 'json',
      name: 'require',
      title: '依赖类型',
    },
    {
      type: 'json',
      name: 'requireField',
      title: '必填字段',
    },
    {
      type: 'json',
      name: 'preRequireField',
      title: '前置必填字段',
    },
    {
      type: 'json',
      name: 'subRequireField',
      title: '子级必填字段',
    },
  ],
});
