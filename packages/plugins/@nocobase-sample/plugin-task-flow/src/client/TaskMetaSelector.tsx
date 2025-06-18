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
import { SearchOutlined, ExpandOutlined, PlusOutlined } from '@ant-design/icons';
import { useAPIClient } from '@nocobase/client';
import { TaskMeta } from './types';
import { TaskMetaUpload } from './TaskMetaUpload';

interface TaskMetaSelectorProps {
  onSelect?: (task: TaskMeta) => void;
  showImportButton?: boolean;
}

export const TaskMetaSelector: React.FC<TaskMetaSelectorProps> = ({ onSelect, showImportButton = true }) => {
  const api = useAPIClient();
  const [taskMetas, setTaskMetas] = useState<TaskMeta[]>([]);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchTaskMeta();
  }, []);

  const fetchTaskMeta = async () => {
    const res = await api.resource('act_task_type').list({ pageSize: 1000 });
    setTaskMetas(res?.data?.data || []);
  };

  const getMatchScore = (item: TaskMeta, keyword: string) => {
    const lower = keyword.toLowerCase();
    const exact = (v?: string) => v?.toLowerCase() === lower;
    const partial = (v?: string) => v?.toLowerCase().includes(lower);

    if (exact(item.value)) return 0;
    if (exact(item.type)) return 1;
    if (exact(item.desc)) return 2;
    if (exact(item.mark)) return 3;

    if (partial(item.value)) return 10;
    if (partial(item.type)) return 11;
    if (partial(item.desc)) return 12;
    if (partial(item.mark)) return 13;

    return Infinity;
  };

  const filtered = useMemo(() => {
    if (!searchText) return taskMetas;
    return [...taskMetas]
      .map((item) => ({ item, score: getMatchScore(item, searchText) }))
      .filter((entry) => entry.score !== Infinity)
      .sort((a, b) => a.score - b.score)
      .map((entry) => entry.item);
  }, [searchText, taskMetas]);

  const renderItem = (taskMeta: TaskMeta, showFull = false) => {
    const tooltipContent = showFull ? (
      <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{JSON.stringify(taskMeta, null, 2)}</pre>
    ) : (
      taskMeta.desc || '无描述'
    );

    return (
      <Tooltip title={tooltipContent} placement="right" key={taskMeta.value}>
        <div
          onClick={() => onSelect?.(taskMeta)}
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
          {taskMeta.value}
        </div>
      </Tooltip>
    );
  };

  const renderList = (showFull: boolean) => {
    if (filtered.length === 0) return <Empty description="未找到匹配的任务" />;
    return (
      <div style={{ maxHeight: showFull ? 500 : 300, overflowY: 'auto' }}>
        {filtered.map((item) => renderItem(item, showFull))}
      </div>
    );
  };

  return (
    <div
      style={{
        position: 'relative',
        padding: 12,
        background: '#fefefe',
        borderRadius: 8,
        border: '1px solid #e0e0e0',
      }}
    >
      <Input
        allowClear
        placeholder="搜索任务元数据（支持 value/type/desc/mark）"
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 8 }}
      />

      {showImportButton && (
        <div style={{ marginBottom: 12 }}>
          <TaskMetaUpload />
        </div>
      )}

      {renderList(false)}

      <Button
        icon={<ExpandOutlined />}
        size="small"
        type="text"
        style={{ position: 'absolute', top: 12, right: 12 }}
        onClick={() => setModalVisible(true)}
      >
        放大
      </Button>

      <Modal
        title="任务元数据列表"
        open={modalVisible}
        footer={null}
        onCancel={() => setModalVisible(false)}
        width={800}
        styles={{ body: { padding: 0 } }}
      >
        <Input
          allowClear
          placeholder="搜索任务元数据（value/type/desc/mark）"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        {renderList(true)}
      </Modal>
    </div>
  );
};
