/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useState } from 'react';
import { Upload, message, Typography } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useAPIClient } from '@nocobase/client';

const { Dragger } = Upload;
const { Text } = Typography;

const tableName = 'act_task_condition';

interface TaskConditionUploadProps {
  onSuccess?: () => void;
}

export const TaskConditionUpload: React.FC<TaskConditionUploadProps> = ({ onSuccess }) => {
  const api = useAPIClient();
  const [loading, setLoading] = useState(false);

  const beforeUpload = async (file: File) => {
    setLoading(true);
    try {
      const text = await file.text();
      const rawData = JSON.parse(text);

      // 支持兼容含 __META_INFO__ 的结构
      const dataList = Object.entries(rawData)
        .filter(([key]) => !key.startsWith('__'))
        .map(([, value]: any) => value);

      if (!Array.isArray(dataList) || dataList.length === 0) {
        message.error('文件格式错误，应为含条件对象的 JSON');
        return false;
      }

      const existing = await api.resource(tableName).list({
        filter: {},
        pageSize: 1000,
      });

      const existingMap = new Map<number, any>();
      for (const record of existing.data.data) {
        existingMap.set(record.id, record);
      }

      const createList = [];
      const updateList = [];

      for (const item of dataList) {
        const { id, ...rest } = item;
        if (id && existingMap.has(id)) {
          updateList.push({ id, values: rest });
        } else {
          createList.push(item);
        }
      }

      if (createList.length) {
        await api.resource(tableName).create({ values: createList });
      }

      for (const update of updateList) {
        await api.resource(tableName).update({
          filterByTk: update.id,
          values: update.values,
        });
      }

      message.success(`导入成功：新增 ${createList.length} 条，更新 ${updateList.length} 条`);
      onSuccess?.();
    } catch (e: any) {
      console.error(e);
      message.error('导入失败：' + (e.message || '未知错误'));
    } finally {
      setLoading(false);
    }
    return false;
  };

  return (
    <Dragger
      beforeUpload={beforeUpload}
      showUploadList={false}
      accept=".json"
      disabled={loading}
      style={{
        padding: 8,
        borderRadius: 4,
        borderWidth: 1,
        fontSize: 12,
        height: 80,
        backgroundColor: '#fafafa',
        cursor: 'pointer',
      }}
    >
      <InboxOutlined style={{ fontSize: 24, color: '#1890ff' }} />
      <Text strong style={{ display: 'block', marginTop: 8, fontSize: 12 }}>
        点击或拖拽上传条件文件
      </Text>
      <Text type="secondary" style={{ fontSize: 10 }}>
        仅支持 JSON，结构为对象集合（含 id）
      </Text>
    </Dragger>
  );
};
