/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useState } from 'react';
import { Button, Modal, Form, Input, message } from 'antd';

import { useResource } from '@nocobase/client';
import { transformNodesForSave } from './utils';
interface SaveTemplateButtonProps {
  nodes: any[];
  edges: any[];
  tmplFetchRef?: () => void;
}

export const SaveTemplateButton: React.FC<SaveTemplateButtonProps> = ({ nodes, edges, tmplFetchRef }) => {
  const flowResource = useResource('act_task_flow');
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const openModal = () => {
    form.resetFields();
    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

  const handleSaveNewTemplate = async ({ id, title, description, nodes, edges }) => {
    const payload = { id, title, description: description || '', nodes, edges };
    await flowResource.create({ values: payload });
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const newId = `tmpl_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      setSaving(true);
      const transformedNodes = transformNodesForSave(nodes);
      await handleSaveNewTemplate({ ...values, id: newId, nodes: transformedNodes, edges });
      tmplFetchRef.current();
      closeModal();
      message.success('保存为新模板成功');
    } catch (error) {
      if (!error.errorFields) {
        console.error(error);
        message.error('保存失败，请重试');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button type="primary" ghost size="middle" onClick={openModal}>
        保存模板
      </Button>
      <Modal
        title="保存为新模板"
        open={modalVisible}
        onCancel={closeModal}
        onOk={handleSave}
        confirmLoading={saving}
        okText="保存"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item label="模板标题" name="title" rules={[{ required: true, message: '请输入模板标题' }]}>
            <Input placeholder="请输入模板标题" />
          </Form.Item>
          <Form.Item label="模板描述" name="description">
            <Input.TextArea placeholder="请输入模板描述（可选）" rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
