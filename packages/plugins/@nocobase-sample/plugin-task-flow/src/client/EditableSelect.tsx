/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useState } from 'react';
import { Select } from 'antd';

interface Option {
  label: string;
  value: string;
}

interface EditableSelectProps {
  value: string;
  fieldName: string;
  options: Option[];
  onSave: (fieldName: string, value: string) => void;
  style?: React.CSSProperties;
  placeholder?: string;
  emptyLabel?: string; // 自定义空值时显示的 label
}

export const EditableSelect: React.FC<EditableSelectProps> = ({
  value,
  fieldName,
  options,
  onSave,
  style,
  placeholder = '请选择',
  emptyLabel = '—', // 默认空值 label 为横线
}) => {
  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    ...style,
  };

  const saveAndExit = (val: string) => {
    onSave(fieldName, val);
    setEditing(false);
  };

  const cancelEdit = () => {
    setTempValue(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <div style={containerStyle}>
        <Select
          autoFocus
          showSearch
          placeholder={placeholder}
          options={options}
          value={tempValue || undefined} // 关键修改点：避免空字符串导致不匹配
          style={{ flex: 1 }}
          onChange={(val) => {
            setTempValue(val);
            saveAndExit(val);
          }}
          onBlur={() => {
            if (!tempValue) cancelEdit();
          }}
          onDropdownVisibleChange={(open) => {
            if (!open && !tempValue) cancelEdit();
          }}
          filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
          allowClear
          onClear={() => saveAndExit('')}
        />
      </div>
    );
  }

  const selectedLabel = options.find((o) => o.value === value)?.label || emptyLabel;

  return (
    <div
      style={{ ...containerStyle, cursor: 'pointer', userSelect: 'none' }}
      onClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
      title="点击编辑"
    >
      <div style={{ flex: 1 }}>{selectedLabel}</div>
    </div>
  );
};
