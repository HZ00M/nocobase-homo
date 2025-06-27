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

export enum TimeStartType {
  USER_REGISTER_TIME = 1,
  WORLD_TIME = 2,
  REGISTER_DAY = 3,
  PARENT_TASK_START_DAY = 4,
  PARENT_TASK_COMPLETE_DAY = 5,
  PRE_TASK_START_DAY = 6,
  PRE_TASK_COMPLETE_DAY = 7,
  USER_REGISTER_TIME_WITH_PRE_TASK_START = 8,
  USER_REGISTER_TIME_WITH_PRE_TASK_COMPLETE = 9,
  WORLD_TIME_WITH_PRE_TASK_START = 10,
  WORLD_TIME_WITH_PRE_TASK_COMPLETE = 11,
  REGISTER_DAY_WITH_PRE_TASK_START = 12,
  REGISTER_DAY_WITH_PRE_TASK_COMPLETE = 13,
  PARENT_TASK_START_DAY_WITH_PRE_TASK_START = 14,
  PARENT_TASK_START_DAY_WITH_PRE_TASK_COMPLETE = 15,
  PARENT_TASK_COMPLETE_DAY_WITH_PRE_TASK_START = 16,
  PARENT_TASK_COMPLETE_DAY_WITH_PRE_TASK_COMPLETE = 17,
}

export enum TimeType {
  time = 1,
  day = 2,
}
export enum TaskType {
  Task = 0,
  ConditionTask = 1,
  ScheduleTask = 2,
  LayerTask = 3,
}
export const TimeStartTypeOptions = [
  { label: '基于用户注册时间', value: TimeStartType.USER_REGISTER_TIME, type: TimeType.day },
  { label: '基于当前世界时间', value: TimeStartType.WORLD_TIME, type: TimeType.time },
  { label: '基于注册天数', value: TimeStartType.REGISTER_DAY, type: TimeType.day },
  { label: '基于父任务开启后第n天开启', value: TimeStartType.PARENT_TASK_START_DAY, type: TimeType.day },
  { label: '基于父任务完成第n天开启', value: TimeStartType.PARENT_TASK_COMPLETE_DAY, type: TimeType.day },
  { label: '基于前置任务开启后第n天开启', value: TimeStartType.PRE_TASK_START_DAY, type: TimeType.day },
  { label: '基于前置任务完成后第n天开启', value: TimeStartType.PRE_TASK_COMPLETE_DAY, type: TimeType.day },
  {
    label: '基于用户注册时间（且前置任务开启）',
    value: TimeStartType.USER_REGISTER_TIME_WITH_PRE_TASK_START,
    type: TimeType.day,
  },
  {
    label: '基于用户注册时间（且前置任务完成）',
    value: TimeStartType.USER_REGISTER_TIME_WITH_PRE_TASK_COMPLETE,
    type: TimeType.day,
  },
  {
    label: '基于当前世界时间（且前置任务开启）',
    value: TimeStartType.WORLD_TIME_WITH_PRE_TASK_START,
    type: TimeType.time,
  },
  {
    label: '基于当前世界时间（且前置任务完成）',
    value: TimeStartType.WORLD_TIME_WITH_PRE_TASK_COMPLETE,
    type: TimeType.time,
  },
  {
    label: '基于注册天数（且前置任务开启）',
    value: TimeStartType.REGISTER_DAY_WITH_PRE_TASK_START,
    type: TimeType.day,
  },
  {
    label: '基于注册天数（且前置任务完成）',
    value: TimeStartType.REGISTER_DAY_WITH_PRE_TASK_COMPLETE,
    type: TimeType.day,
  },
  {
    label: '基于父任务开启后第n天开启（且前置任务开启）',
    value: TimeStartType.PARENT_TASK_START_DAY_WITH_PRE_TASK_START,
    type: TimeType.day,
  },
  {
    label: '基于父任务开启后第n天开启（且前置任务完成）',
    value: TimeStartType.PARENT_TASK_START_DAY_WITH_PRE_TASK_COMPLETE,
    type: TimeType.day,
  },
  {
    label: '基于父任务完成第n天开启（且前置任务开启）',
    value: TimeStartType.PARENT_TASK_COMPLETE_DAY_WITH_PRE_TASK_START,
    type: TimeType.day,
  },
  {
    label: '基于父任务完成第n天开启（且前置任务完成）',
    value: TimeStartType.PARENT_TASK_COMPLETE_DAY_WITH_PRE_TASK_COMPLETE,
    type: TimeType.day,
  },
];
