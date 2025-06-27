/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React from 'react';
import { Select } from 'antd';
import { useTaskConditions } from './TaskConditionContext';

interface ConditionSelectorProps {
  value?: string;
  onChange?: (val: string) => void;
}

export const ConditionSelector: React.FC<ConditionSelectorProps> = ({ value, onChange }) => {
  const { taskConditions } = useTaskConditions();

  // 转换条件为Select.Option格式，value使用 condition.value，label 显示 conditionType - value
  const options = taskConditions.map((cond) => ({
    label: `${cond.conditionType} - ${cond.value}`,
    value: cond.value,
  }));

  return (
    <Select
      showSearch
      allowClear
      placeholder="请选择完成条件"
      options={options}
      filterOption={(input, option) => option?.label.toLowerCase().includes(input.toLowerCase())}
      value={value}
      onChange={onChange}
      style={{ width: '100%' }}
      optionLabelProp="label"
    />
  );
};
