/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Button, Empty, Input, Modal, Pagination, Spin, Tooltip } from 'antd';
import { ExpandOutlined, SearchOutlined } from '@ant-design/icons';
import { useAPIClient } from '@nocobase/client';
import { TaskConditionUpload } from './TaskConditionUpload';
import { useTaskConditions } from './TaskConditionContext';
import { operatorLabels } from './useReadableConditions';
import debounce from 'lodash.debounce';

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

export const TaskConditionOperator: React.FC<TaskConditionOperatorProps> = ({ onSelectCondition }) => {
  const api = useAPIClient();
  const [searchText, setSearchText] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [taskList, setTaskList] = useState<TaskCondition[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const { setTaskConditions } = useTaskConditions();

  const fetchConditions = async (page = 1, keyword = '') => {
    setLoading(true);
    const res = await api.resource('act_task_condition').list({
      pageSize,
      page,
      filter: keyword
        ? {
            $or: [
              { conditionType: { $contains: keyword } },
              { operator: { $contains: keyword } },
              { value: { $contains: keyword } },
              { desc: { $contains: keyword } },
            ],
          }
        : undefined,
    });

    const conditions = res?.data?.data || [];
    setTaskList(conditions);
    setTotal(res?.data?.meta?.count || 0);
    setTaskConditions(conditions); // 同步全局
    setCurrentPage(page);
    setLoading(false);
  };

  // 防抖搜索
  const debounceSearch = useCallback(
    debounce((value: string) => {
      setSearchKeyword(value);
      fetchConditions(1, value);
    }, 300),
    [],
  );

  useEffect(() => {
    fetchConditions(currentPage, searchKeyword);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    debounceSearch(value);
  };

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
      {/* 顶部搜索 */}
      <div style={{ flexShrink: 0, display: 'flex', gap: 8, marginBottom: 8 }}>
        <Input
          allowClear
          placeholder="搜索"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={handleSearchChange}
          style={{ flex: 1 }}
        />
        <Button icon={<ExpandOutlined />} type="text" onClick={() => setModalVisible(true)} />
      </div>

      {/* 列表展示 */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingRight: 4,
        }}
      >
        {loading ? (
          <Spin />
        ) : taskList.length > 0 ? (
          taskList.map((item) => renderItem(item))
        ) : (
          <Empty description="未找到匹配的条件" />
        )}
      </div>

      {/* 弹窗展示 */}
      <Modal
        title="条件元数据列表"
        open={modalVisible}
        footer={null}
        onCancel={() => setModalVisible(false)}
        width={800}
      >
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', height: '80vh' }}>
          <TaskConditionUpload onSuccess={() => fetchConditions(currentPage, searchKeyword)} />
          <Input
            allowClear
            placeholder="搜索条件元数据"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={handleSearchChange}
            style={{ marginBottom: 16, marginTop: 8 }}
          />
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <Spin />
            ) : taskList.length > 0 ? (
              taskList.map((item) => renderItem(item, true))
            ) : (
              <Empty description="未找到匹配的条件" />
            )}
          </div>
          <Pagination
            current={currentPage}
            total={total}
            pageSize={pageSize}
            showSizeChanger={false}
            onChange={(page) => fetchConditions(page, searchKeyword)}
            style={{ marginTop: 16, textAlign: 'right' }}
          />
        </div>
      </Modal>
    </div>
  );
};
