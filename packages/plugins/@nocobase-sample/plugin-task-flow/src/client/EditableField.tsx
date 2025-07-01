/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useState } from 'react';
import { Input } from 'antd';

interface EditableFieldProps {
  value: string;
  fieldName: string;
  onSave: (fieldName: string, value: string) => void;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  style?: React.CSSProperties;
}

export const EditableField: React.FC<EditableFieldProps> = ({ value, fieldName, onSave, inputProps, style }) => {
  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [isComposing, setIsComposing] = useState(false);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    ...style,
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
  };

  const saveAndExit = () => {
    onSave(fieldName, tempValue);
    setEditing(false);
  };

  const cancelEdit = () => {
    setTempValue(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <div style={containerStyle}>
        <Input
          {...inputProps}
          size="small"
          autoFocus
          value={tempValue}
          style={inputStyle}
          onChange={(e) => setTempValue(e.target.value)}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={(e) => {
            setIsComposing(false);
            setTempValue(e.currentTarget.value);
          }}
          onBlur={saveAndExit}
          onPressEnter={() => {
            if (!isComposing) {
              saveAndExit();
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              cancelEdit();
            }
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{ ...containerStyle, cursor: 'pointer' }}
      onClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
      title="点击编辑"
    >
      <div style={{ flex: 1 }}>{value || '（点击输入）'}</div>
    </div>
  );
};
