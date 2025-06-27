/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Input, Modal, Button, Tooltip, Empty } from 'antd';
import { SearchOutlined, ExpandOutlined } from '@ant-design/icons';
import { useAPIClient } from '@nocobase/client';
import { TaskConditionUpload } from './TaskConditionUpload';
import { useTaskConditions } from './TaskConditionContext';

interface TaskCondition {
  id: number;
  operator: string;
  conditionType: string;
  value: string;
  desc: string;
}

interface TaskConditionOperatorProps {
  onSelectCondition?: (condition: TaskCondition) => void;
}
const operatorLabels: Record<string, string> = {
  Equal: '=',
  NotEqual: '!=',
  GreaterThan: '>',
  GreaterThanOrEqual: '≥',
  LessThan: '<',
  LessThanOrEqual: '≤',
  and: 'AND',
  or: 'OR',
};
export const TaskConditionOperator: React.FC<TaskConditionOperatorProps> = ({ onSelectCondition }) => {
  const api = useAPIClient();
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const { taskConditions, setTaskConditions } = useTaskConditions();
  useEffect(() => {
    fetchConditions();
  }, []);

  const fetchConditions = async () => {
    const res = await api.resource('act_task_condition').list({ pageSize: 1000 });
    const conditions = res?.data?.data;
    setTaskConditions(conditions || []);
  };

  const getMatchScore = (item: TaskCondition, keyword: string) => {
    const lower = keyword.toLowerCase();
    const exact = (v?: string) => v?.toLowerCase() === lower;
    const partial = (v?: string) => v?.toLowerCase().includes(lower);

    if (exact(item.conditionType)) return 0;
    if (exact(item.operator)) return 1;
    if (exact(item.value)) return 2;
    if (exact(item.desc)) return 3;

    if (partial(item.conditionType)) return 10;
    if (partial(item.operator)) return 11;
    if (partial(item.value)) return 12;
    if (partial(item.desc)) return 13;

    return Infinity;
  };

  const filtered = useMemo(() => {
    if (!searchText) return taskConditions;
    return [...taskConditions]
      .map((item) => ({ item, score: getMatchScore(item, searchText) }))
      .filter((entry) => entry.score !== Infinity)
      .sort((a, b) => a.score - b.score)
      .map((entry) => entry.item);
  }, [searchText, taskConditions]);

  const renderItem = (item: TaskCondition, showFull = false) => {
    const tooltipContent = showFull ? (
      <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{JSON.stringify(item, null, 2)}</pre>
    ) : (
      item.desc || '无描述'
    );

    const label = (() => {
      const op = operatorLabels[item.operator] || item.operator;
      const val = Array.isArray(item.value) ? item.value.join(', ') : String(item.value);
      return `#${item.id}: ${item.conditionType || '条件'} ${op} ${val}`;
    })();

    return (
      <Tooltip title={tooltipContent} placement="right" key={item.id}>
        <div
          onClick={() => onSelectCondition?.(item)}
          style={{
            background: '#fff',
            borderRadius: 6,
            border: '1px solid #e5e6eb',
            padding: '8px 12px',
            marginBottom: 8,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
          }}
        >
          {label}
        </div>
      </Tooltip>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 顶部固定部分 */}
      <div style={{ flexShrink: 0, display: 'flex', gap: 8, marginBottom: 8 }}>
        <Input
          allowClear
          placeholder="搜索"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ flex: 1 }}
        />
        <Button icon={<ExpandOutlined />} type="text" onClick={() => setModalVisible(true)} />
      </div>

      {/* 列表区域，占满剩余空间且内部滚动 */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingRight: 4, // 防止滚动条遮挡内容
        }}
      >
        {filtered.length > 0 ? filtered.map((item) => renderItem(item)) : <Empty description="未找到匹配的条件" />}
      </div>

      {/* 弹窗 */}
      <Modal
        title="条件元数据列表"
        open={modalVisible}
        footer={null}
        onCancel={() => setModalVisible(false)}
        width={800}
        style={{ body: { padding: 0 } }}
      >
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', height: '80vh' }}>
          <TaskConditionUpload onSuccess={fetchConditions} />
          <Input
            allowClear
            placeholder="搜索条件元数据"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ marginBottom: 16, marginTop: 8 }}
          />
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filtered.length > 0 ? (
              filtered.map((item) => renderItem(item, true))
            ) : (
              <Empty description="未找到匹配的条件" />
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
