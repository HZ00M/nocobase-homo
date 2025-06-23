/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

export function transformNodesForSave(nodes: any[]): any[] {
  return nodes.map((node) => ({
    id: node.id,
    type: node.type,
    position: node.position,
    width: node.width,
    height: node.height,
    data: {
      label: node.data?.label || '',
      parentId: node.data?.parentId || '',
      activityId: node.data?.activityId || '',
      parentTaskId: node.data?.parentTaskId || '',
      promiseTaskId: node.data?.promiseTaskId || '',
      taskId: node.data?.taskId || node.id,
      nodeType: node.data?.nodeType || '',
      taskType: node.data?.taskType || '',
      targetProcess: node.data?.targetProcess || 0,
      weight: node.data?.weight || 0,
      condition: node.data?.condition || '',
      rewardType: node.data?.rewardType || '',
      reward: node.data?.reward || '',
      desc: node.data?.desc || '',
      sortId: node.data?.sortId || 0,
      timeType: node.data?.timeType || 0,
      startTime: node.data?.startTime || '',
      endTime: node.data?.endTime || '',
      offsetTime: node.data?.offsetTime || 0,
      extraInfo: node.data?.extraInfo || {},
    },
  }));
}
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(deepClone) as any;

  const result: any = {};
  for (const key in obj) {
    result[key] = deepClone(obj[key]);
  }
  return result;
}

export function deepMergeSources<T = any>(...sources: Partial<T>[]): T {
  const isObject = (obj: any) => obj && typeof obj === 'object' && !Array.isArray(obj);

  const merge = (target: any, source: any): any => {
    for (const key in source) {
      const sourceValue = source[key];
      const targetValue = target[key];

      if (isObject(sourceValue)) {
        target[key] = merge(isObject(targetValue) ? { ...targetValue } : {}, sourceValue);
      } else {
        target[key] = deepClone(sourceValue);
      }
    }
    return target;
  };

  // 从第一个 source 拷贝出初始对象
  const base = deepClone(sources[0] ?? {});
  return sources.slice(1).reduce((acc, cur) => merge(acc, cur), base as any);
}
