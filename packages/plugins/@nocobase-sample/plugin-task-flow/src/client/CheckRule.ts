/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

// checkRules.ts
import { CheckLevel, CheckItem } from './CheckIcon';
import type { Node } from 'reactflow';
import type { TaskData } from './types';
import { useTaskMetas } from './TaskMetaContext';
import { useAwardMetas } from './AwardMetaContext';
import { TaskType } from './constants';
export interface CheckRule {
  name: string;
  apply: (node: Node<TaskData>, allNodes: Node<TaskData>[]) => CheckItem[];
}

export const checkRules: CheckRule[] = [
  {
    name: '保证 taskId 唯一性',
    apply: (node, allNodes) => {
      const sameIdNodes = allNodes.filter((n) => n.data.taskId === node.data.taskId);
      if (node.data.taskId && sameIdNodes.length > 1) {
        return [
          {
            title: 'taskId 不唯一',
            message: `taskId "${node.data.taskId}" 重复`,
            level: CheckLevel.ERROR,
            relatedIds: sameIdNodes.map((n) => n.id),
          },
        ];
      }
      return [];
    },
  },
  {
    name: '检查父任务是否存在',
    apply: (node, allNodes) => {
      if (node.data.parentTaskId) {
        const parent = allNodes.find((n) => n.data.taskId === node.data.parentTaskId);
        if (!parent) {
          return [
            {
              title: '父任务不存在',
              message: `找不到 parentTaskId: "${node.data.parentTaskId}"`,
              level: CheckLevel.WARN,
              relatedIds: [node.id],
            },
          ];
        }
      }
      return [];
    },
  },
  {
    name: '禁止节点引用自身为父任务',
    apply: (node) => {
      if (node.data.taskId && node.data.parentTaskId === node.data.taskId) {
        return [
          {
            title: '父子任务循环引用',
            message: '节点不能引用自己为父任务',
            level: CheckLevel.ERROR,
            relatedIds: [node.id],
          },
        ];
      }
      return [];
    },
  },
  {
    name: '检查前置任务是否存在',
    apply: (node, allNodes) => {
      if (node.data.promiseTaskId) {
        const prev = allNodes.find((n) => n.data.taskId === node.data.promiseTaskId);
        if (!prev) {
          return [
            {
              title: '前置任务不存在',
              message: `找不到 promiseTaskId: "${node.data.promiseTaskId}"`,
              level: CheckLevel.WARN,
              relatedIds: [node.id],
            },
          ];
        }
      }
      return [];
    },
  },
  {
    name: '检查任务时间范围合法性',
    apply: (node) => {
      const { startTime, endTime } = node.data;
      if (startTime && endTime && new Date(startTime) > new Date(endTime)) {
        return [
          {
            title: '时间范围错误',
            message: `开始时间不能晚于结束时间：${startTime} > ${endTime}`,
            level: CheckLevel.ERROR,
            relatedIds: [node.id],
          },
        ];
      }
      return [];
    },
  },
  {
    name: '检查是否填写了任务标题',
    apply: (node) => {
      if (!node.data.label || node.data.label.trim() === '') {
        return [
          {
            title: '任务标题缺失',
            message: '任务标题不能为空',
            level: CheckLevel.WARN,
            relatedIds: [node.id],
          },
        ];
      }
      return [];
    },
  },
  {
    name: '检查是否设置了任务类型',
    apply: (node) => {
      const isConditionTask = node.data.meta?.type == TaskType[TaskType.ConditionTask];
      if (isConditionTask && !node.data.taskType) {
        return [
          {
            title: '任务类型未设置',
            message: '请为该任务选择一个 taskType',
            level: CheckLevel.WARN,
            relatedIds: [node.id],
          },
        ];
      }
      return [];
    },
  },
  {
    name: '检查是否配置奖励类型和奖励内容',
    apply: (node) => {
      const { rewardType, reward } = node.data;
      if (rewardType && !reward) {
        return [
          {
            title: '奖励内容缺失',
            message: `已选择奖励类型(${rewardType})，但未填写奖励内容`,
            level: CheckLevel.WARN,
            relatedIds: [node.id],
          },
        ];
      }
      return [];
    },
  },
  {
    name: '禁止节点之间形成环',
    apply: (node, allNodes) => {
      const visited = new Set<string>();
      const taskId = node.data.taskId;
      const map = new Map(allNodes.map((n) => [n.data.taskId, n]));

      function hasCycle(currentId: string): boolean {
        if (visited.has(currentId)) return true;
        visited.add(currentId);
        const current = map.get(currentId);
        if (!current || !current.data.parentTaskId) return false;
        return hasCycle(current.data.parentTaskId);
      }

      if (taskId && hasCycle(taskId)) {
        return [
          {
            title: '检测到任务环',
            message: '父任务引用形成闭环',
            level: CheckLevel.ERROR,
            relatedIds: [node.id],
          },
        ];
      }
      return [];
    },
  },
  {
    name: '子节点不符合 require 要求',
    apply: (node, allNodes) => {
      const requireRaw = node.data.meta?.require;
      const taskId = node.data.taskId;
      if (!requireRaw || !taskId) return [];

      let requireArr: string[];
      try {
        const parsed = JSON.parse(requireRaw);
        if (!Array.isArray(parsed)) return [];
        requireArr = parsed;
      } catch {
        return [
          {
            title: 'Require 字段解析失败',
            message: 'require 字段不是合法的 JSON 数组字符串',
            level: CheckLevel.ERROR,
          },
        ];
      }
      if (!requireArr.length) return [];
      const children = allNodes.filter((n) => n.data.parentTaskId === taskId);
      const invalidChildren = children.filter((c) => !requireArr.includes(c.data.nodeType));

      if (invalidChildren.length === 0) return [];

      return [
        {
          title: '子节点类型不符合要求',
          message: `期望类型: [${requireArr.join(', ')}]，实际不符: ${invalidChildren
            .map((c) => c.data.nodeType)
            .join(', ')}`,
          level: CheckLevel.ERROR,
          relatedIds: invalidChildren.map((c) => c.id),
        },
      ];
    },
  },
  {
    name: '子节点类型包含在 meta.exclude 中',
    apply: (node, allNodes) => {
      const excludeRaw = node.data.meta?.exclude;
      const taskId = node.data.taskId;
      if (!excludeRaw || !taskId) return [];

      let excludeArr: string[];
      try {
        excludeArr = JSON.parse(excludeRaw);
        if (!Array.isArray(excludeArr)) return [];
      } catch {
        return [
          {
            title: 'Exclude 字段解析失败',
            message: 'exclude 字段不是合法的 JSON 数组字符串',
            level: CheckLevel.ERROR,
          },
        ];
      }
      if (!excludeArr.length) return [];
      const children = allNodes.filter((n) => n.data.parentTaskId === taskId);
      const invalid = children.filter((c) => excludeArr.includes(c.data.nodeType));

      if (!invalid.length) return [];

      return [
        {
          title: '子节点包含被排除的类型',
          message: `不应包含子类型: [${excludeArr.join(', ')}]，实际有: ${invalid
            .map((c) => c.data.nodeType)
            .join(', ')}`,
          level: CheckLevel.ERROR,
          relatedIds: invalid.map((c) => c.id),
        },
      ];
    },
  },
  {
    name: '子节点未包含 meta.include 中指定类型',
    apply: (node, allNodes) => {
      const includeRaw = node.data.meta?.include;
      const taskId = node.data.taskId;
      if (!includeRaw || !taskId) return [];

      let includeArr: string[];
      try {
        includeArr = JSON.parse(includeRaw);
        if (!Array.isArray(includeArr)) return [];
      } catch {
        return [
          {
            title: 'Include 字段解析失败',
            message: 'include 字段不是合法的 JSON 数组字符串',
            level: CheckLevel.ERROR,
          },
        ];
      }
      if (!includeArr.length) return [];
      const children = allNodes.filter((n) => n.data.parentTaskId === taskId);
      const hasValid = children.some((c) => includeArr.includes(c.data.nodeType));
      if (hasValid) return [];

      return [
        {
          title: '子节点缺少指定类型',
          message: `需要至少包含一个子节点类型为: [${includeArr.join(', ')}]`,
          level: CheckLevel.ERROR,
          relatedIds: children.map((c) => c.id),
        },
      ];
    },
  },
  {
    name: '父节点缺少 preRequireField 指定字段',
    apply: (node, allNodes) => {
      const raw = node.data.meta?.preRequireField;
      if (!raw) return [];
      let requireArr: string[];
      try {
        requireArr = JSON.parse(raw);
      } catch {
        return [
          {
            title: 'preRequireField 字段解析失败',
            message: 'preRequireField 不是合法的 JSON 数组字符串',
            level: CheckLevel.ERROR,
          },
        ];
      }
      if (!Array.isArray(requireArr) || requireArr.length === 0) {
        return []; // 为空或非数组时跳过
      }

      // 找到父节点
      const parent = allNodes.find((n) => n.data.taskId === node.data.parentTaskId);
      if (!parent) {
        // 如果没有父节点，也不算错误
        return [];
      }

      // 检查父节点上哪些字段缺失
      const missing = requireArr.filter((field) => {
        const v = (parent.data as any)[field];
        return v === undefined || v === null || String(v).trim() === '';
      });
      if (missing.length === 0) {
        return [];
      }

      return [
        {
          title: '父节点缺少必要字段',
          message: `父节点需配置字段: [${missing.join(', ')}]`,
          level: CheckLevel.ERROR,
          relatedIds: [parent.id],
        },
      ];
    },
  },

  {
    name: '当前节点缺少 requireField 指定字段',
    apply: (node) => {
      const raw = node.data.meta?.requireField;
      if (!raw) return [];
      let requireArr: string[];
      try {
        requireArr = JSON.parse(raw);
      } catch {
        return [
          {
            title: 'requireField 字段解析失败',
            message: 'requireField 不是合法的 JSON 数组字符串',
            level: CheckLevel.ERROR,
          },
        ];
      }
      if (!Array.isArray(requireArr) || requireArr.length === 0) {
        return []; // 如果不是数组或为空，就跳过
      }
      // 找出所有缺失的字段
      const missing = requireArr.filter((field) => {
        const v = (node.data as any)[field];
        return v === undefined || v === null || String(v).trim() === '';
      });
      if (missing.length === 0) {
        return [];
      }
      return [
        {
          title: '缺少必要字段',
          message: `需填写字段: [${missing.join(', ')}]`,
          level: CheckLevel.ERROR,
        },
      ];
    },
  },

  {
    name: '子节点缺少 subRequireField 指定字段',
    apply: (node, allNodes) => {
      const raw = node.data.meta?.subRequireField;
      if (!raw) return [];
      let requireArr: string[];
      try {
        requireArr = JSON.parse(raw);
      } catch {
        return [
          {
            title: 'subRequireField 字段解析失败',
            message: 'subRequireField 不是合法的 JSON 数组字符串',
            level: CheckLevel.ERROR,
          },
        ];
      }
      if (!Array.isArray(requireArr) || requireArr.length === 0) {
        return []; // 没有配置就跳过
      }
      const children = allNodes.filter((n) => n.data.parentTaskId === node.data.taskId);
      // 收集那些在任意一个 requireArr 中字段未填的子节点
      const invalidChildren = children.filter((child) =>
        requireArr.some((field) => {
          const v = (child.data as any)[field];
          return v === undefined || v === null || String(v).trim() === '';
        }),
      );
      if (invalidChildren.length === 0) {
        return [];
      }
      return [
        {
          title: '子节点缺少必填字段',
          message: `子节点必须填写字段: [${requireArr.join(', ')}]`,
          level: CheckLevel.ERROR,
          relatedIds: invalidChildren.map((c) => c.id),
        },
      ];
    },
  },
  {
    name: '流程中只能存在一个根节点',
    apply: (node, allNodes) => {
      // 根节点定义为 parentTaskId 为空的节点
      const rootNodes = allNodes.filter((n) => !n.data.parentTaskId);

      // 如果超过 1 个根节点，说明是多树结构
      if (rootNodes.length > 1) {
        // 当前节点是否是其中一个 root
        const isRoot = !node.data.parentTaskId;
        if (isRoot) {
          return [
            {
              title: '存在多个根节点',
              message: `当前流程中检测到多个根节点（即没有父任务的节点）`,
              level: CheckLevel.ERROR,
              relatedIds: rootNodes.map((n) => n.id),
            },
          ];
        }
      }
      return [];
    },
  },
];
