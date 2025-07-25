/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Button, Empty, Input, Modal, Tooltip } from 'antd';
import { ExpandOutlined, SearchOutlined } from '@ant-design/icons';
import { useAPIClient } from '@nocobase/client';
import { TaskMeta } from './types';
import { TaskMetaUpload } from './TaskMetaUpload';
import { useTaskMetas } from './TaskMetaContext';
import { useAwardMetas } from './AwardMetaContext';

interface TaskMetaSelectorProps {
  onAddTask?: (parentId: string, task: TaskMeta) => void;
}

export const TaskMetaOperator: React.FC<TaskMetaSelectorProps> = ({ onAddTask }) => {
  const api = useAPIClient();
  const { taskMetas, setTaskMetas } = useTaskMetas();
  const { awardMetas, setAwardMetas } = useAwardMetas();
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchTaskMeta();
    fetchAwardMeta();
  }, []);
  const taskTypeOptions = taskMetas.map((meta) => ({
    label: meta.desc || meta.value,
    value: meta.value,
  }));
  const fetchTaskMeta = async () => {
    const res = await api
      .resource('act_task_type')
      .list({
        pageSize: 1000,
        filter: {
          type: {
            $ne: 'TaskAward',
          },
        },
      })
      .then((res) => {
        const data = res?.data?.data || [];
        setTaskMetas(data);
        console.log('fetched task res:', res);
        console.log('fetched task data:', data);
        console.log('fetched task metas:', taskMetas);
      });
  };
  const fetchAwardMeta = async () => {
    const res = await api
      .resource('act_task_type')
      .list({
        pageSize: 1000,
        filter: {
          type: {
            $eq: 'TaskAward',
          },
        },
      })
      .then((res) => {
        const data = res?.data?.data || [];
        setAwardMetas(data);
      });
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
          onClick={() => onAddTask?.(null, taskMeta)}
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

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingRight: 4, // 防止滚动条遮挡内容
        }}
      >
        {filtered.length > 0 ? filtered.map((item) => renderItem(item)) : <Empty description="未找到匹配的条件" />}
      </div>

      <Modal
        title="任务元数据列表"
        open={modalVisible}
        footer={null}
        onCancel={() => setModalVisible(false)}
        width={800}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ padding: 16 }}>
          <TaskMetaUpload
            onSuccess={() => {
              fetchTaskMeta();
              fetchAwardMeta();
            }}
          />
          <Input
            allowClear
            placeholder="搜索任务元数据（value/type/desc/mark）"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ marginBottom: 16 }}
          />
          <div style={{ maxHeight: 500, overflowY: 'auto' }}>
            {filtered.length > 0 ? (
              filtered.map((item) => renderItem(item, true))
            ) : (
              <Empty description="未找到匹配的任务" />
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
