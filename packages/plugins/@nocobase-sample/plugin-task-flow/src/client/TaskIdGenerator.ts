/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

// TaskIdGenerator.ts
import type { Node } from 'reactflow';
import type { TaskData } from './types';

export class TaskIdGenerator {
  private counters = new Map<string, number>();

  constructor(existingNodes: Node<TaskData>[] = []) {
    this.initFromNodes(existingNodes);
  }

  public initFromNodes(nodes: Node<TaskData>[]) {
    const maxMap = new Map<string, number>();

    for (const node of nodes) {
      const nodeType = node.data.nodeType;
      const match = node.id.match(new RegExp(`^${nodeType}_(\\d+)$`));
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num)) {
          const prev = maxMap.get(nodeType) || 0;
          maxMap.set(nodeType, Math.max(prev, num));
        }
      }
    }

    this.counters = maxMap;
  }

  /**
   * 生成当前 taskType 的下一个编号（纯数字）
   */
  next(taskType: string): number {
    const current = this.counters.get(taskType) || 0;
    const next = current + 1;
    this.counters.set(taskType, next);
    return next;
  }

  /**
   * 返回完整 id，例如 taskA_3
   */
  nextId(taskType: string): string {
    return this.idFormat(taskType, this.next(taskType));
  }
  /**
   * 返回完整 id，例如 taskA_3
   */
  idFormat(taskType: string, incr: number): string {
    return `${taskType}_${incr}`;
  }
  /**
   * 重置所有计数器（可选）
   */
  reset() {
    this.counters.clear();
  }
}
