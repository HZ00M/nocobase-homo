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
  value: string; // 当前选中的 value
  fieldName: string;
  options: Option[]; // 选择列表
  onSave: (fieldName: string, value: string) => void;
  style?: React.CSSProperties;
  placeholder?: string;
}

export const EditableSelect: React.FC<EditableSelectProps> = ({
  value,
  fieldName,
  options,
  onSave,
  style,
  placeholder,
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
          value={tempValue || undefined}
          style={{ flex: 1 }}
          onChange={(val) => {
            setTempValue(val);
            saveAndExit(val);
          }}
          onBlur={() => {
            // 如果未选择，则取消编辑
            if (!tempValue) {
              cancelEdit();
            }
          }}
          onDropdownVisibleChange={(open) => {
            // 关闭下拉时如果没有选中则取消编辑
            if (!open && !tempValue) {
              cancelEdit();
            }
          }}
          filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
          allowClear
          onClear={() => {
            saveAndExit('');
          }}
        />
      </div>
    );
  }

  // 显示文字部分
  const selectedLabel = options.find((o) => o.value === value)?.label || '（点击选择）';

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
