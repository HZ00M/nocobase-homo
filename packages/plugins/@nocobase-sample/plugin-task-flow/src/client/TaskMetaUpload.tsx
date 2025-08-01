/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useState } from 'react';
import { message, Typography, Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useAPIClient } from '@nocobase/client';

const { Dragger } = Upload;
const { Text } = Typography;

const taleName = 'act_task_type';
interface TaskMetaUploadProps {
  onSuccess?: () => void;
}
export const TaskMetaUpload: React.FC<TaskMetaUploadProps> = ({ onSuccess }) => {
  const api = useAPIClient();
  const [loading, setLoading] = useState(false);

  const beforeUpload = async (file: File) => {
    setLoading(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // if (!Array.isArray(data)) {
      //   message.error('文件格式错误，应为数组');
      //   return false;
      // }

      const existing = await api.resource(taleName).list({
        filter: {},
        pageSize: 1000,
      });

      const existingMap = new Map<string, any>();
      for (const record of existing.data.data) {
        existingMap.set(record.value, record);
      }

      const createList = [];
      const updateList = [];

      for (const item of data) {
        const formatted: Record<string, any> = {};
        const jsonFields = [
          // 'value',
          // 'type',
          // 'desc',
          'inheritance',
          'className',
          'include',
          'exclude',
          'require',
          'requireField',
          'preRequireField',
          'subRequireField',
        ];
        // 遍历 item 中每个字段，如果是 json 字段，则 stringify，否则原样复制
        for (const key in item) {
          if (jsonFields.includes(key)) {
            formatted[key] = typeof item[key] === 'string' ? item[key] : JSON.stringify(item[key] || []);
          } else {
            formatted[key] = item[key];
          }
        }

        const existingItem = existingMap.get(item.value);
        if (existingItem) {
          updateList.push({ id: existingItem.id, values: formatted });
        } else {
          createList.push(formatted);
        }
      }

      if (createList.length) {
        await api.resource(taleName).create({ values: createList });
      }

      for (const update of updateList) {
        await api.resource(taleName).update({
          filterByTk: update.id,
          values: update.values,
        });
      }

      message.success(`导入成功：新增 ${createList.length} 条，更新 ${updateList.length} 条`);
      onSuccess();
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
        点击或拖拽上传元文件
      </Text>
      <Text type="secondary" style={{ fontSize: 10 }}>
        仅支持 JSON，内容为数组
      </Text>
    </Dragger>
  );
};
