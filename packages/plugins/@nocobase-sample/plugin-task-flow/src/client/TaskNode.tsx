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
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />

      <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: 8 }}>{data.label}</div>

      <div style={{ fontSize: '12px', color: '#333', marginBottom: 8, lineHeight: 1.4 }}>
        <div>
          <strong>任务id：</strong>
          {data.taskId}
        </div>
        <div>
          <strong>任务类型：</strong>
          {data.taskType}
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
        {data.extraInfo &&
          Object.entries(data.extraInfo).map(([key, value]) => (
            <div key={key}>
              <strong>{key}：</strong>
              {String(value)}
            </div>
          ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <button
          style={buttonStyle}
          onClick={() => {
            data.onAddChild?.(data.taskId);
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
      </div>

      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </div>
  );
};

export default TaskNode;
