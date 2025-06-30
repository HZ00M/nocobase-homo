/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

// useReadableConditions.ts
import { useTaskConditions } from './TaskConditionContext';

export const operatorLabels: Record<string, string> = {
  Equal: '=',
  NotEqual: '!=',
  GreaterThan: '>',
  GreaterThanOrEqual: '≥',
  LessThan: '<',
  LessThanOrEqual: '≤',
  and: 'AND',
  or: 'OR',
};

export function useReadableConditions() {
  const { taskConditions } = useTaskConditions();

  const getReadableCondition = (conditionId: string | number, indentLevel = 0): string => {
    const indent = '  '.repeat(indentLevel);
    const condition = taskConditions.find((item) => String(item.id) === String(conditionId));
    if (!condition) return `${indent}#${conditionId}: 未找到条件`;

    const op = operatorLabels[condition.operator] || condition.operator;

    if (condition.operator === 'and' || condition.operator === 'or') {
      const subIds = String(condition.value || '')
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);

      const subTexts = subIds.map((id) => getReadableCondition(id, indentLevel + 1));
      return `${indent}#${condition.id}: ${op} 条件组合\n${subTexts.join('\n')}`;
    }

    const val = Array.isArray(condition.value) ? condition.value.join(', ') : String(condition.value ?? '');

    return `${indent}#${condition.id}: ${condition.conditionType || '字段'} ${op} ${val}`;
  };

  return { getReadableCondition };
}
