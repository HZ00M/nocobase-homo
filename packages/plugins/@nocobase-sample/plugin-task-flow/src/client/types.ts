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
  className?: string;
  inheritance: object;
  include: string;
  exclude: string;
  require: string;
  requireField: string;
  preRequireField: string;
  subRequireField: string;
}

export interface TaskData {
  meta: TaskMeta;
  label: string;
  parentId: string;
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
  startTimeStr: string;
  endTimeStr: string;
  offsetTime: number;
  extraInfo: Record<string, any>;

  [key: string]: any;
}

export interface Position {
  x: number;
  y: number;
}

export interface TaskNodeData {
  id: string;
  type: string;
  width: number;
  height: number;
  position: Position;
  data: TaskData;
}

export interface TaskEdge {
  id: string;
  source: string;
  target: string;

  [key: string]: any;
}

export interface TaskFlowTemplate {
  id: string;
  title: string;
  description?: string;
  nodes: TaskNodeData[];
  edges: TaskEdge[];
}
