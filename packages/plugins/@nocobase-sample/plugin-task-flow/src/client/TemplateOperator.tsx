/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Button, Empty, Form, Input, message, Modal, Popconfirm, Tooltip } from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  ExpandOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useResource } from '@nocobase/client';
import { TaskTemplateUpload } from './TaskTemplateUpload';

interface Template {
  id: string;
  title: string;
  description: string;
}

interface TemplateSelectorProps {
  onSelect: (id: string) => void;
  nodes: any[];
  edges: any[];
  onRefetch?: (fn: () => void) => void;
}

export const TemplateOperator: React.FC<TemplateSelectorProps> = ({ onSelect, nodes, edges, onRefetch }) => {
  const flowResource = useResource('act_task_flow');
  const [moreVisible, setMoreVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const [templateList, setTemplateList] = useState<Template[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const fetchTemplates = async () => {
    const { data } = await flowResource.list({ filter: {}, pageSize: 1000 });
    setTemplateList(
      data?.data?.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
      })) || [],
    );
  };

  const handleEdit = (tpl: Template) => {
    setEditingTemplate(tpl);
    setEditModalVisible(true);
  };

  const handleDelete = async (tpl: Template) => {
    try {
      await flowResource.destroy({ filter: { id: tpl.id } });
      message.success('模板已删除');
      fetchTemplates();
    } catch (err) {
      message.error('删除失败');
    }
  };

  const handleUpdateTemplate = async (values: { title: string; description: string }) => {
    if (!editingTemplate) return;
    try {
      await flowResource.update({
        filter: { id: editingTemplate.id },
        values,
      });
      message.success('模板已更新');
      fetchTemplates();
      setEditModalVisible(false);
      setEditingTemplate(null);
    } catch (err) {
      message.error('更新失败');
    }
  };

  useEffect(() => {
    fetchTemplates();
    onRefetch?.(() => fetchTemplates());
  }, []);

  const openMore = () => setMoreVisible(true);
  const closeMore = () => setMoreVisible(false);

  const getMatchScore = (tpl: Template, keyword: string) => {
    const kw = keyword.toLowerCase();
    const exact = (v?: string) => v?.toLowerCase() === kw;
    const partial = (v?: string) => v?.toLowerCase().includes(kw);

    if (exact(tpl.title)) return 0;
    if (exact(tpl.description)) return 1;
    if (partial(tpl.title)) return 10;
    if (partial(tpl.description)) return 11;
    return Infinity;
  };

  const filtered = useMemo(() => {
    if (!searchText) return templateList;
    return [...templateList]
      .map((tpl) => ({ tpl, score: getMatchScore(tpl, searchText) }))
      .filter((entry) => entry.score !== Infinity)
      .sort((a, b) => a.score - b.score)
      .map((entry) => entry.tpl);
  }, [templateList, searchText]);

  // 外部列表（不带编辑按钮）
  const renderReadOnlyItem = (tpl: Template) => (
    <Tooltip key={tpl.id} title={tpl.description || '无描述'}>
      <div
        onClick={() => {
          onSelect(tpl.id);
          setMoreVisible(false);
        }}
        style={{
          background: '#fff',
          borderRadius: 6,
          border: '1px solid #e5e6eb',
          padding: '8px 12px',
          marginBottom: 8,
          cursor: 'pointer',
          fontSize: 14,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {tpl.title}
      </div>
    </Tooltip>
  );

  // 弹窗中的模板项，带编辑 & 删除按钮
  const renderModalItem = (tpl: Template) => (
    <div
      key={tpl.id}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#fff',
        borderRadius: 6,
        border: '1px solid #e5e6eb',
        padding: '8px 12px',
        marginBottom: 8,
      }}
    >
      <Tooltip title={tpl.description || '无描述'}>
        <div
          onClick={() => {
            onSelect(tpl.id);
            setMoreVisible(false);
          }}
          style={{
            flex: 1,
            marginRight: 8,
            fontSize: 14,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            cursor: 'pointer',
          }}
        >
          {tpl.title}
        </div>
      </Tooltip>
      <div style={{ display: 'flex', gap: 8 }}>
        <Tooltip title="编辑">
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(tpl)} />
        </Tooltip>
        <Tooltip title="删除">
          <Popconfirm
            title="确定删除此模板？"
            icon={<ExclamationCircleOutlined />}
            onConfirm={() => handleDelete(tpl)}
            okText="删除"
            cancelText="取消"
          >
            <Button type="text" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Tooltip>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flexShrink: 0, display: 'flex', gap: 8, marginBottom: 8 }}>
        <Input
          allowClear
          placeholder="搜索"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ flex: 1 }}
        />
        <Button icon={<ExpandOutlined />} size="small" type="text" onClick={openMore}></Button>
      </div>
      {/* 外层列表：只读，不带编辑/删除 */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length > 0 ? (
          filtered.map(renderReadOnlyItem)
        ) : (
          <Empty description="未找到匹配的模板" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </div>
      {/* 更多模板选择 Modal */}
      <Modal title="模板列表" open={moreVisible} onCancel={closeMore} footer={null} width={600} destroyOnClose>
        <TaskTemplateUpload onSuccess={fetchTemplates} />
        <Input
          allowClear
          placeholder="搜索模板标题或描述"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ margin: '16px 0' }}
        />
        {/* 弹窗里的列表：可编辑删除 */}
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {filtered.length > 0 ? (
            filtered.map(renderModalItem)
          ) : (
            <Empty description="未找到模板" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </div>
      </Modal>

      <Modal
        title="编辑模板"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingTemplate(null);
        }}
        onOk={() => form.submit()}
        okText="保存"
        destroyOnClose
      >
        <Form form={form} initialValues={editingTemplate || {}} onFinish={handleUpdateTemplate} layout="vertical">
          <Form.Item name="title" label="模板名称" rules={[{ required: true, message: '请输入模板名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="模板描述">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
