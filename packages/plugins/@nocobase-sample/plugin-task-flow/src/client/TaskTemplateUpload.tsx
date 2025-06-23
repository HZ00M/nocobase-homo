/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useState } from 'react';
import { InboxOutlined } from '@ant-design/icons';
import { Modal, Upload, Typography, message, Checkbox, Input, Form, Button } from 'antd';
import { useResource } from '@nocobase/client';
import { deepMergeSources } from './utils';
import { taskNodeTemplate } from './constants';
import { useTaskMetas } from './TaskMetaContext';
import { v4 as uuidv4 } from 'uuid';

const { Dragger } = Upload;
const { Text } = Typography;

function parseFlowsFromJson(data: any) {
  const flowsMap = new Map<string, any[]>();
  for (const key of Object.keys(data)) {
    if (key === '__META_INFO__') continue;
    const item = data[key];
    const activityId = item.activityId || 'unknown';
    if (!flowsMap.has(activityId)) flowsMap.set(activityId, []);
    flowsMap.get(activityId)!.push(item);
  }
  return Array.from(flowsMap.entries()).map(([activityId, items]) => ({
    activityId,
    items,
  }));
}

interface TaskTemplateUploadProps {
  onSuccess?: () => void;
}

export const TaskTemplateUpload: React.FC<TaskTemplateUploadProps> = ({ onSuccess }) => {
  const { taskMetas } = useTaskMetas();
  const flowResource = useResource('act_task_flow');
  const [visible, setVisible] = useState(false);
  const [flows, setFlows] = useState<any[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [formValues, setFormValues] = useState({});
  const [form] = Form.useForm();

  const beforeUpload = async (file: File) => {
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const parsed = parseFlowsFromJson(json);
      setFlows(parsed);
      const initialFormValues: any = {};
      parsed.forEach((flow) => {
        initialFormValues[flow.activityId] = { title: '', description: '' };
      });
      form.setFieldsValue(initialFormValues);
      setFormValues(initialFormValues);
      setVisible(true);
    } catch (e) {
      message.error('解析失败：' + e.message);
    }
    return false;
  };

  const handleOk = async () => {
    for (const flow of flows) {
      if (!selectedKeys.includes(flow.activityId)) continue;
      const { title, description } = formValues[flow.activityId] || {};
      if (!title) {
        message.warning(`请填写活动 ${flow.activityId} 的标题`);
        return;
      }

      const nodes = flow.items.map((item: any) => {
        const { __ROW_INDEX__, activityId, ...rest } = item;
        const meta = taskMetas.find((m) => m.value === rest.nodeType);
        return deepMergeSources(taskNodeTemplate, {
          id: rest.taskId, // 先用 taskId 临时赋值，后面会更新成 uuid
          position: { x: 0, y: 0 },
          data: {
            ...rest,
            label: rest.desc || rest.taskId,
            meta: meta || { value: rest.nodeType || 'Task', desc: '未知类型' },
            parentTaskId: rest.parentTaskId || '', // 业务上的父任务ID
          },
        });
      });

      const taskIdToNodeId = new Map<string, string>();

      // 先给每个节点生成新的唯一 id（uuid），并建立 taskId -> 新id 的映射
      nodes.forEach((node) => {
        const newId = uuidv4();
        taskIdToNodeId.set(node.data.taskId, newId);
        node.id = newId;
      });

      // 再根据 parentTaskId 查找对应父节点的新 id，赋给 node.data.parentId
      nodes.forEach((node) => {
        const parentTaskId = node.data.parentTaskId;
        if (parentTaskId && taskIdToNodeId.has(parentTaskId)) {
          node.data.parentId = taskIdToNodeId.get(parentTaskId)!;
        } else {
          node.data.parentId = ''; // 没有父节点就空字符串
        }
      });

      const edges = nodes
        .filter((n) => n.data.parentId)
        .map((n) => ({
          id: `edge-${n.data.parentId}-${n.id}`,
          source: n.data.parentId,
          target: n.id,
          type: 'default',
          animated: true,
        }));

      await flowResource.create({
        values: {
          id: `tmpl_${uuidv4()}`,
          title,
          description: description || '',
          nodes,
          edges,
        },
      });
    }

    message.success('导入成功');
    setVisible(false);
    onSuccess?.();
  };

  return (
    <>
      <Dragger
        beforeUpload={beforeUpload}
        showUploadList={false}
        accept=".json"
        style={{
          padding: 8,
          borderRadius: 4,
          borderWidth: 1,
          fontSize: 12,
          height: 80,
        }}
      >
        <InboxOutlined style={{ fontSize: 24, color: '#1890ff' }} />
        <Text strong style={{ display: 'block', marginTop: 8, fontSize: 12 }}>
          上传任务模板文件
        </Text>
        <Text type="secondary" style={{ fontSize: 10 }}>
          支持 JSON 格式，含多个流程
        </Text>
      </Dragger>

      <Modal
        title="选择要导入的流程模板"
        open={visible}
        onCancel={() => setVisible(false)}
        onOk={handleOk}
        okText="导入"
        destroyOnClose
        width={800}
      >
        {flows.map(({ activityId }) => (
          <div
            key={activityId}
            style={{
              padding: 12,
              border: '1px solid #eee',
              borderRadius: 6,
              marginBottom: 12,
            }}
          >
            <Checkbox
              checked={selectedKeys.includes(activityId)}
              onChange={(e) => {
                setSelectedKeys((prev) =>
                  e.target.checked ? [...prev, activityId] : prev.filter((id) => id !== activityId),
                );
              }}
            >
              活动 ID：{activityId}
            </Checkbox>
            {selectedKeys.includes(activityId) && (
              <div style={{ marginTop: 12 }}>
                <Form layout="vertical" form={form} onValuesChange={(_, allValues) => setFormValues(allValues)}>
                  <Form.Item
                    label="模板标题"
                    name={[activityId, 'title']}
                    rules={[{ required: true, message: '请输入标题' }]}
                  >
                    <Input placeholder="请输入标题" />
                  </Form.Item>
                  <Form.Item label="模板描述" name={[activityId, 'description']}>
                    <Input.TextArea rows={2} placeholder="请输入描述" />
                  </Form.Item>
                </Form>
              </div>
            )}
          </div>
        ))}
      </Modal>
    </>
  );
};
