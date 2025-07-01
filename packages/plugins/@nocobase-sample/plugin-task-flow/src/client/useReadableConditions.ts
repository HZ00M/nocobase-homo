/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

// useReadableConditions.ts
import { useAPIClient } from '@nocobase/client';
import { useCallback } from 'react';

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
  const api = useAPIClient();
  const getConditionById = useCallback(
    async (conditionId: string | number) => {
      try {
        const res = await api.resource('act_task_condition').get({ filterByTk: conditionId });
        return res?.data?.data || null;
      } catch (e) {
        return null;
      }
    },
    [api],
  );
  const getReadableCondition = useCallback(
    async (conditionId: string | number, indentLevel = 0): Promise<string> => {
      const indent = '  '.repeat(indentLevel);

      try {
        const res = await api.resource('act_task_condition').get({ filterByTk: conditionId });
        const condition = res?.data?.data;

        if (!condition) return `${indent}#${conditionId}: 未找到条件`;

        const op = operatorLabels[condition.operator] || condition.operator;

        if (condition.operator === 'and' || condition.operator === 'or') {
          const subIds = String(condition.value || '')
            .split(',')
            .map((id: string) => id.trim())
            .filter(Boolean);

          const subTexts = await Promise.all(subIds.map((id: string) => getReadableCondition(id, indentLevel + 1)));

          return `${indent}#${condition.id}: ${op} 组合条件\n${subTexts.join('\n')}`;
        }

        const val = Array.isArray(condition.value) ? condition.value.join(', ') : String(condition.value ?? '');

        return `${indent}#${condition.id}: ${condition.conditionType || '字段'} ${op} ${val}`;
      } catch (e) {
        return `${indent}#${conditionId}: 查询失败`;
      }
    },
    [api],
  );

  return { getConditionById, getReadableCondition };
}
