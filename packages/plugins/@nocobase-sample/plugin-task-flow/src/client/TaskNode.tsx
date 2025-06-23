/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { TaskMeta, TaskData } from './types';
import { EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Input } from 'antd';
const getCardStyle = (selected: boolean): React.CSSProperties => ({
  border: selected ? '2px solid #1890ff' : '1px solid #ddd',
  borderRadius: 6,
  padding: 12,
  backgroundColor: '#fff',
  fontSize: 14,
  width: 220,
  boxShadow: selected ? '0 0 0 4px rgba(24, 144, 255, 0.2)' : '0 2px 8px rgba(0,0,0,0.1)',
  userSelect: 'none',
  cursor: 'pointer',
});

const buttonStyle: React.CSSProperties = {
  flex: '1 1 auto',
  padding: '6px 12px',
  borderRadius: 4,
  border: 'none',
  backgroundColor: '#1890ff',
  color: '#fff',
  cursor: 'pointer',
};

const secondaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: '#f0f0f0',
  color: '#333',
};

export const TaskNode: React.FC<NodeProps<TaskData>> = ({ data, isConnectable, id, selected }) => {
  return (
    <div
      style={getCardStyle(selected)}
      onClick={(e) => {
        e.stopPropagation();
        data.onSelect?.(id);
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{
          ...handleStyle,
          top: -6, // 微调位置避免与边框重叠
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        {data.editing ? (
          <>
            <Input
              size="small"
              value={data.tempLabel}
              onChange={(e) => data.onChangeTempLabel?.(e.target.value)}
              onPressEnter={() => data.onConfirmEditLabel?.()}
              style={{ flex: 1, marginRight: 4 }}
            />
            <CheckOutlined
              onClick={(e) => {
                e.stopPropagation();
                data.onConfirmEditLabel?.();
              }}
              style={{ color: '#1890ff', cursor: 'pointer', marginRight: 4 }}
            />
            <CloseOutlined
              onClick={(e) => {
                e.stopPropagation();
                data.onCancelEditLabel?.();
              }}
              style={{ color: '#aaa', cursor: 'pointer' }}
            />
          </>
        ) : (
          <>
            <div style={{ fontWeight: 'bold', fontSize: '14px', flex: 1 }}>{data.label}</div>
            <EditOutlined
              onClick={(e) => {
                e.stopPropagation();
                data.onStartEditLabel?.();
              }}
              style={{ color: '#1890ff', marginLeft: 4, cursor: 'pointer' }}
            />
          </>
        )}
      </div>

      <div style={{ fontSize: '12px', color: '#333', marginBottom: 8, lineHeight: 1.4 }}>
        <div>
          <strong>任务ID：</strong>
          {data.taskId}
        </div>
        <div>
          <strong>任务类型：</strong>
          {data.nodeType}
        </div>
        <div>
          <strong>开始时间：</strong>
          {data.startTime}
        </div>
        <div>
          <strong>结束时间：</strong>
          {data.endTime}
        </div>
        <div>
          <strong>父任务ID：</strong>
          {data.parentTaskId || '无'}
        </div>
        <div>
          <strong>前置任务ID：</strong>
          {data.promiseTaskId || '无'}
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <button
          style={buttonStyle}
          onClick={() => {
            data.onAddChild?.(id);
          }}
        >
          添加
        </button>
        <button
          style={{ ...secondaryButtonStyle, backgroundColor: '#e74c3c', color: '#fff' }}
          onClick={() => data.onDelete?.(id)}
        >
          删除
        </button>
        <button
          style={secondaryButtonStyle}
          onClick={(e) => {
            e.stopPropagation();
            data.onToggleCollapse?.(id);
          }}
        >
          {data.collapsed ? '展开' : '折叠'}
        </button>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        style={{
          ...handleStyle,
          bottom: -6,
        }}
      />
    </div>
  );
};
const handleStyle: React.CSSProperties = {
  width: 12,
  height: 12,
  backgroundColor: '#1890ff',
  border: '2px solid #fff',
  borderRadius: '50%',
  boxShadow: '0 0 4px rgba(0, 0, 0, 0.15)',
  transition: 'transform 0.2s',
};

const handleHoverStyle: React.CSSProperties = {
  transform: 'scale(1.3)',
};

export default TaskNode;
