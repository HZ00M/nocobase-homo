/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, { addEdge, Node, Edge, NodeChange, OnNodesChange } from 'reactflow';
import 'reactflow/dist/style.css';
import { useResource } from '@nocobase/client';
import { useFieldSchema } from '@formily/react';
import { Form, Input, message, Modal } from 'antd';
import { TaskMetaSelector } from './TaskMetaSelector';
import { EditTaskModal } from './EditTaskModal';
import { TaskNode } from './TaskNode';
import { useTaskNodes } from './useTaskNodes';
import { TemplateSelector } from './TemplateSelector';
const nodeTypes = { stacked: TaskNode };
import type { TaskMeta, TaskData } from './types';

export const TaskDesigner: React.FC = () => {
  const {
    nodes,
    setNodes,
    edges,
    setEdges,
    addNewTask,
    deleteNode,
    onNodesChange,
    onEdgesChange,
    layoutPyramid,
    onNodeSelect,
    getEnhancedNodes,
    importTemplateById,
    resetNodeInfo,
    onConnect,
  } = useTaskNodes([], []);

  const flowResource = useResource('act_task_flow');
  const schema = useFieldSchema();
  const schemaUid = schema?.['x-uid'];
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [editVisible, setEditVisible] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [templateList, setTemplateList] = useState<any[]>([]);
  const [savingNewTemplate, setSavingNewTemplate] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // const fetchFlow = async () => {
    //   const { data } = await flowResource.get({ filter: { id: schemaUid } });
    //   if (data?.data?.nodes) setNodes(data.data.nodes);
    //   if (data?.data?.edges) setEdges(data.data.edges);
    // };
    // if (schemaUid) fetchFlow();

    const fetchTemplates = async () => {
      const { data } = await flowResource.list({
        filter: {},
        pageSize: 100,
        appends: [],
      });
      setTemplateList(data?.data?.map((t) => ({ id: t.id, title: t.title })) ?? []);
    };
    fetchTemplates();
  }, [schemaUid]);
  const handleNodesChange: OnNodesChange = (changes: NodeChange[]) => {
    const snap = (val: number) => Math.round(val / 50) * 50;
    const snapped = changes.map((change) => {
      if (change.type === 'position' && change.position) {
        return { ...change, position: { x: snap(change.position.x), y: snap(change.position.y) } };
      }
      return change;
    });
    onNodesChange(snapped);
  };

  const [form] = Form.useForm();
  // 打开弹窗
  const openNewTemplateModal = () => {
    form.resetFields();
    setModalVisible(true);
  };
  // 关闭弹窗
  const closeNewTemplateModal = () => {
    setModalVisible(false);
  };
  // 保存新模板
  const handleSaveNewTemplate = async () => {
    try {
      const values = await form.validateFields();
      setSavingNewTemplate(true);

      const newId = `tmpl_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

      const payload = {
        id: newId,
        title: values.title,
        description: values.description || '',
        nodes,
        edges,
      };

      await flowResource.create({ values: payload });

      // 刷新模板列表
      const { data } = await flowResource.list({
        filter: {},
        pageSize: 100,
      });
      setTemplateList(data?.data?.map((t) => ({ id: t.id, title: t.title })) ?? []);

      message.success('保存为新模板成功');
      setModalVisible(false);
    } catch (error) {
      if (error.errorFields) {
        // 表单校验错误，忽略
      } else {
        console.error(error);
        message.error('保存失败，请重试');
      }
    } finally {
      setSavingNewTemplate(false);
    }
  };

  const exportToJson = () => {
    const flow = { nodes, edges };
    setJsonText(JSON.stringify(flow, null, 2));
  };

  const importFromJson = () => {
    try {
      const flow = JSON.parse(jsonText);
      if (flow.nodes && flow.edges) {
        setNodes(flow.nodes);
        setEdges(flow.edges);
        setTimeout(() => setNodes((nds) => layoutPyramid(nds)), 0);
      } else {
        alert('导入的 JSON 格式不正确');
      }
    } catch (e) {
      alert('JSON 解析失败');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        id: schemaUid,
        title: `任务流程-${new Date().toISOString()}`,
        description: '自动保存的流程图',
        nodes,
        edges,
      };
      let exists = false;
      try {
        await flowResource.get({ filter: { id: schemaUid } });
        exists = true;
      } catch (e) {
        if (e?.response?.status !== 404) throw e;
      }
      if (exists) {
        await flowResource.update({ filter: { id: schemaUid }, values: payload });
      } else {
        await flowResource.create({ values: payload });
      }
      message.success('保存成功');
    } catch (err) {
      console.error('保存失败', err);
      message.error('保存失败，请检查控制台');
    } finally {
      setSaving(false);
    }
  };
  // 这里新增清空画布函数
  const clearCanvas = () => {
    Modal.confirm({
      title: '确认清空画布？',
      content: '此操作将删除所有任务节点和连接，无法撤销。',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        resetNodeInfo();
        message.info('画布已清空');
      },
    });
  };
  return (
    <div style={{ display: 'flex', height: 800 }}>
      <div style={{ width: 240, background: '#f5f5f5', padding: 10 }}>
        <h4>添加任务</h4>
        <TaskMetaSelector
          onSelect={(selectedNodeId, taskMeta) => {
            console.log('selectedNodeId :', selectedNodeId);
            console.log('选择的任务元数据 :', taskMeta);
            addNewTask(selectedNodeId, taskMeta);
          }}
        />
        <h4>流程模板列表</h4>
        <TemplateSelector templates={templateList} onSelect={importTemplateById} />
        <hr />
        {/* 新增按钮 */}
        <button
          onClick={openNewTemplateModal}
          style={{
            width: '100%',
            marginTop: 12,
            marginBottom: 12,
            backgroundColor: '#1890ff',
            color: '#fff',
            border: 'none',
            padding: '6px 12px',
            cursor: 'pointer',
          }}
        >
          保存为新模板
        </button>
        {/* 新增按钮 */}
        <button
          onClick={clearCanvas}
          style={{
            width: '100%',
            backgroundColor: '#f5222d',
            color: '#fff',
            border: 'none',
            padding: '8px 12px',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          清空画布
        </button>
        <hr />
        <button onClick={exportToJson} style={{ ...buttonStyle, width: '100%', marginBottom: 6 }}>
          导出流程图 JSON
        </button>
        <button onClick={importFromJson} style={{ ...buttonStyle, width: '100%', marginBottom: 6 }}>
          导入流程图 JSON
        </button>
        <button
          onClick={() => setNodes(layoutPyramid(nodes))}
          style={{ ...buttonStyle, width: '100%', marginBottom: 6 }}
        >
          重新布局
        </button>
        <button onClick={handleSave} style={{ ...buttonStyle, width: '100%' }}>
          保存到数据库
        </button>
        <textarea
          style={{ width: '100%', height: 120, marginTop: 10, fontSize: 12, fontFamily: 'monospace' }}
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder="JSON 内容粘贴/显示在这里"
        />
      </div>
      <div ref={reactFlowWrapper} style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={getEnhancedNodes()}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onNodeClick={(event, node) => {
            event.preventDefault();
            onNodeSelect(node.id);
          }}
          onNodeDoubleClick={(event, node) => {
            setEditingNode(node);
            setEditVisible(true);
          }}
          onPaneClick={() => onNodeSelect(null)} // 👈 点击空白区域取消选中
          fitView
          attributionPosition="bottom-left"
        />
      </div>
      {/* 👇 编辑任务弹窗，写在 ReactFlow 外 */}
      <EditTaskModal
        visible={editVisible}
        node={editingNode}
        onSave={(updatedNode) => {
          setNodes((nds) => nds.map((n) => (n.id === updatedNode.id ? updatedNode : n)));
          setEditVisible(false);
          setEditingNode(null);
        }}
        onCancel={() => {
          setEditVisible(false);
          setEditingNode(null);
        }}
      />
      {/* 新增保存为新模板Modal */}
      <Modal
        title="保存为新模板"
        open={modalVisible}
        onCancel={closeNewTemplateModal}
        onOk={handleSaveNewTemplate}
        confirmLoading={savingNewTemplate}
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
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#4a90e2',
  color: '#fff',
  border: 'none',
  padding: '6px 10px',
  borderRadius: '8px',
  fontSize: '12px',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
};
