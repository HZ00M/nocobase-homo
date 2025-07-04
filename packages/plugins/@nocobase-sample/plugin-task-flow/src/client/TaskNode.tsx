/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useState } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { TaskData } from './types';
import { EditableField } from './EditableField';
import { CheckIcon } from './CheckIcon';
import { calcOffsetDates } from './EditTaskModal';
import { TimeStartTypeOptions } from './constants';
import { EditableSelect } from './EditableSelect';
import { useTaskNodesContext } from './TaskNodesContext';
import { useTaskMetas } from './TaskMetaContext';

// 卡片样式
const getCardStyle = (selected: boolean, highlight?: boolean): React.CSSProperties => ({
  border: highlight ? '2px dashed #f5222d' : selected ? '2px solid #1890ff' : '1px solid #ddd',
  boxShadow: highlight
    ? '0 0 6px rgba(255,0,0,0.6)'
    : selected
      ? '0 0 0 4px rgba(24, 144, 255, 0.2)'
      : '0 2px 8px rgba(0,0,0,0.1)',
  transition: 'box-shadow 0.3s ease-in-out',
  borderRadius: 6,
  padding: 12,
  backgroundColor: '#fff',
  fontSize: 14,
  width: 240,
  userSelect: 'none',
  cursor: 'pointer',
});

// 按钮样式
const getButtonStyle = (bgColor: string): React.CSSProperties => ({
  flex: '1 1 auto',
  padding: '6px 12px',
  borderRadius: 4,
  border: 'none',
  cursor: 'pointer',
  backgroundColor: bgColor,
  color: '#fff',
});

// 右侧文本内容统一省略样式 + title tooltip
const rightContentStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  cursor: 'default',
};

// 左侧 label 固定宽度不压缩
const leftLabelStyle: React.CSSProperties = {
  whiteSpace: 'nowrap',
  flexShrink: 0,
  width: 70, // 可根据需求调整
  userSelect: 'none',
  fontWeight: '600',
};

export const TaskNode: React.FC<NodeProps<TaskData>> = ({ data, isConnectable, id, selected }) => {
  const { nodes, setNodes, nodeOptions } = useTaskNodesContext();
  const { label, taskId, setNodeField, checkResult } = data;
  const [showAllData, setShowAllData] = useState(false);
  const { options: metaOptions, taskMetas } = useTaskMetas();

  const onTaskTypeChange = (fieldName: string, value: string) => {
    const selectedMeta = taskMetas.find((meta) => meta.value === value);
    if (!selectedMeta) return;

    setNodeField?.(id, 'nodeType', value);
    setNodeField?.(id, 'meta', selectedMeta);
  };

  const updateTaskIdInfo = (nodeId: string, fieldName: string, value: any) => {
    setNodes((curNodes) => {
      const node = curNodes.find((n) => n.id === nodeId);
      if (!node) return curNodes;
      const oldValue = node.data[fieldName];

      const updatedNodes = curNodes.map((n) => {
        if (n.id === nodeId) {
          return {
            ...n,
            data: {
              ...n.data,
              [fieldName]: value,
            },
          };
        }
        return n;
      });

      if (fieldName === 'taskId' && oldValue !== value) {
        return updatedNodes.map((n) => {
          const newData = { ...n.data };
          let changed = false;
          if (newData.promiseTaskId === oldValue) {
            newData.promiseTaskId = value;
            changed = true;
          }
          if (newData.parentTaskId === oldValue) {
            newData.parentTaskId = value;
            changed = true;
          }
          if (changed) {
            return {
              ...n,
              data: newData,
            };
          }
          return n;
        });
      }

      return updatedNodes;
    });
  };

  return (
    <div
      style={getCardStyle(selected, data.highlight)}
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
          top: -6,
        }}
      />

      <CheckIcon
        result={checkResult}
        onClick={(id) => {
          data.onCheck?.(id);
        }}
      />

      {/* 任务标题 */}
      <div
        style={{
          fontSize: 15,
          fontWeight: 500,
          color: '#1f1f1f',
          marginBottom: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
        title={label}
      >
        <EditableField
          value={label}
          fieldName="label"
          onSave={(fieldName, val) => setNodeField?.(id, fieldName, val)}
          style={{ flex: 1 }}
        />
      </div>

      {/* 详情区 */}
      <div style={{ fontSize: '12px', color: '#333', marginBottom: 8, lineHeight: 1.6 }}>
        {/* 任务ID */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <strong style={leftLabelStyle}>任务ID：</strong>
          <div style={{ ...rightContentStyle }} title={taskId}>
            <EditableField
              value={taskId}
              fieldName="taskId"
              onSave={(fieldName, val) => updateTaskIdInfo(id, fieldName, val)}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* 任务类型 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <strong style={leftLabelStyle}>任务类型：</strong>
          <div style={{ ...rightContentStyle }} title={taskId}>
            <EditableSelect
              value={data.nodeType}
              fieldName="nodeType"
              options={metaOptions}
              onSave={onTaskTypeChange}
              placeholder="请选择任务类型"
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* 开启类型 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <strong style={leftLabelStyle}>开启类型：</strong>
          <span
            style={rightContentStyle}
            title={TimeStartTypeOptions.find((opt) => opt.value === data.timeType)?.label || '未知'}
          >
            {TimeStartTypeOptions.find((opt) => opt.value === data.timeType)?.label || '未知'}
          </span>
        </div>

        {/* 开始时间 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <strong style={leftLabelStyle}>开始时间：</strong>
          <span style={rightContentStyle} title={calcOffsetDates(data.timeType, data.startTime, data.offsetTime)}>
            {calcOffsetDates(data.timeType, data.startTime, data.offsetTime)}
          </span>
        </div>

        {/* 结束时间 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <strong style={leftLabelStyle}>结束时间：</strong>
          <span style={rightContentStyle} title={calcOffsetDates(data.timeType, data.endTime, data.offsetTime)}>
            {calcOffsetDates(data.timeType, data.endTime, data.offsetTime)}
          </span>
        </div>

        {/* 父任务ID */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <strong style={leftLabelStyle}>父任务ID：</strong>
          <span style={rightContentStyle} title={data.parentTaskId || '无'}>
            {data.parentTaskId || '无'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <strong style={leftLabelStyle}>前置任务ID：</strong>
          <div style={{ ...rightContentStyle }} title={taskId}>
            <EditableSelect
              value={data.promiseTaskId} // 这里需要根据实际情况设置初始值
              fieldName="promiseTaskId"
              options={nodeOptions}
              onSave={(fieldName, val) => setNodeField?.(id, fieldName, val)}
              emptyLabel="未设置前置任务"
              placeholder="请选择前置任务"
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* 按钮组 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <button style={getButtonStyle('#52c41a')} onClick={() => data.onAddChild?.(id)}>
          添加
        </button>
        <button
          style={getButtonStyle('#108ee9')}
          onClick={(e) => {
            e.stopPropagation();
            data.onEdit?.(id);
          }}
        >
          编辑
        </button>
        <button style={getButtonStyle('#e74c3c')} onClick={() => data.onDelete?.(id)}>
          删除
        </button>
        <button
          style={{
            ...getButtonStyle('#faad14'),
            color: '#000',
            fontWeight: 500,
            border: '1px solid #d48806',
            backgroundColor: '#fffbe6',
          }}
          onClick={(e) => {
            e.stopPropagation();
            data.onToggleCollapse?.(id);
          }}
        >
          {data.collapsed ? '展开' : '折叠'}
        </button>
      </div>

      {/* 额外数据展示 */}
      {showAllData && (
        <div
          style={{
            marginTop: 8,
            backgroundColor: '#f7f7f7',
            border: '1px solid #d9d9d9',
            padding: 8,
            borderRadius: 4,
            fontSize: 12,
            color: '#444',
            maxHeight: 200,
            overflowY: 'auto',
            wordBreak: 'break-word',
          }}
        >
          <pre style={{ margin: 0 }}>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}

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
