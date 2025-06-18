/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, DatePicker } from 'antd';
import dayjs from 'dayjs';
import type { Node } from 'reactflow';
import type { TaskData } from './types'; // 请按实际路径调整

interface EditTaskModalProps {
  visible: boolean;
  node: Node<TaskData> | null;
  onSave: (node: Node<TaskData>) => void;
  onCancel: () => void;
}

const { RangePicker } = DatePicker;

export const EditTaskModal: React.FC<EditTaskModalProps> = ({ visible, node, onSave, onCancel }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (node) {
      const { data } = node;
      form.setFieldsValue({
        ...data,
        timeRange: data.startTime && data.endTime ? [dayjs(data.startTime), dayjs(data.endTime)] : undefined,
      });
    } else {
      form.resetFields();
    }
  }, [node, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      const updatedNode: Node<TaskData> = {
        ...node!,
        data: {
          ...node!.data,
          ...values,
          startTime: values.timeRange?.[0]?.format('YYYY-MM-DD') || '',
          endTime: values.timeRange?.[1]?.format('YYYY-MM-DD') || '',
        },
      };

      onSave(updatedNode);
    } catch (err) {
      console.warn('Validation failed:', err);
    }
  };

  return (
    <Modal open={visible} title="编辑任务" onOk={handleOk} onCancel={onCancel} width={600}>
      <Form form={form} layout="vertical">
        <Form.Item name="label" label="标题" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="taskType" label="任务类型" rules={[{ required: true }]}>
          <Select
            options={[
              { label: '主线', value: 'main' },
              { label: '支线', value: 'side' },
              { label: '其他', value: 'other' },
            ]}
          />
        </Form.Item>

        <Form.Item name="nodeType" label="节点类型">
          <Select
            options={[
              { label: '普通节点', value: 'default' },
              { label: '条件节点', value: 'condition' },
            ]}
          />
        </Form.Item>

        <Form.Item name="targetProcess" label="目标流程">
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="timeRange" label="时间范围">
          <RangePicker />
        </Form.Item>

        <Form.Item name="timeType" label="时间类型">
          <Select
            options={[
              { label: '绝对时间', value: 0 },
              { label: '相对时间', value: 1 },
            ]}
          />
        </Form.Item>

        <Form.Item name="offsetTime" label="相对偏移（秒）">
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="condition" label="完成条件">
          <Input.TextArea rows={2} />
        </Form.Item>

        <Form.Item name="rewardType" label="奖励类型">
          <Select
            options={[
              { label: '无', value: 'none' },
              { label: '积分', value: 'score' },
              { label: '物品', value: 'item' },
            ]}
          />
        </Form.Item>

        <Form.Item name="reward" label="奖励内容">
          <Input />
        </Form.Item>

        <Form.Item name="desc" label="描述">
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
