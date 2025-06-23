/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { TaskNodeData } from './types';

export const taskNodeTemplate: TaskNodeData = {
  id: 'Task_init',
  type: 'stacked',
  width: 220,
  height: 182,
  position: {
    x: 280,
    y: 0,
  },
  data: {
    meta: {
      value: 'Task',
      type: 'unknown',
      desc: '未知任务',
      mark: '',
    },
    parentId: '',
    label: 'Task_init',
    activityId: '',
    parentTaskId: '',
    promiseTaskId: '',
    taskId: '',
    nodeType: 'Task',
    taskType: '',
    targetProcess: undefined,
    weight: undefined,
    condition: '',
    rewardType: '',
    reward: '',
    desc: '',
    sortId: undefined,
    timeType: undefined,
    startTime: '',
    startTimeStr: '',
    endTimeStr: '',
    endTime: '',
    offsetTime: 0,
    extraInfo: {},
  },
};
