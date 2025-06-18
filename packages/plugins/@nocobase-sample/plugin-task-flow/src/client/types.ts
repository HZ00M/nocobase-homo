/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

export interface TaskMeta {
  id?: number;
  value: string;
  type?: string;
  desc?: string;
  mark?: string;
  [key: string]: any;
}

export interface TaskData {
  meta: TaskMeta;

  // onAddChild: (parentNode: Node) => void;
  label: string;
  activityId: string;
  parentTaskId: string;
  promiseTaskId: string;
  taskId: string;
  nodeType: string;
  taskType: string;
  targetProcess: number;
  weight: number;
  condition: string;
  rewardType: string;
  reward: string;
  desc: string;
  sortId: number;
  timeType: number;
  startTime: string;
  endTime: string;
  offsetTime: number;
  extraInfo: Record<string, any>;
  [key: string]: any;
}
