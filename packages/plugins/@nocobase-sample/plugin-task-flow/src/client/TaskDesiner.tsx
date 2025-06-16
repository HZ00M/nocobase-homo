/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  NodeProps,
  Node,
  Edge,
  OnNodesChange,
  NodeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useResource } from '@nocobase/client';
import { useFieldSchema } from '@formily/react';
import { message } from 'antd';

const TaskNode: React.FC<NodeProps> = ({ data, isConnectable, id }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={cardStyle}>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: 8 }}>{data.label}</div>
      {expanded && (
        <div style={{ fontSize: '12px', color: '#333', marginBottom: 8, lineHeight: 1.4 }}>
          <div>
            <strong>任务类型：</strong>
            {data.taskType}
          </div>
          <div>
            <strong>开始时间：</strong>
            {data.startTime}
          </div>
          <div>
            <strong>结束时间：</strong>
            {data.endTime}
          </div>
          <div>
            <strong>父任务ID：</strong>
            {data.parentId || '无'}
          </div>
          {data.kvs &&
            Object.entries(data.kvs).map(([key, value]) => (
              <div key={key}>
                <strong>{key}：</strong>
                {value}
              </div>
            ))}
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <button style={buttonStyle} onClick={() => data.onAddChild?.(id)}>
          添加子任务
        </button>
        <button style={secondaryButtonStyle} onClick={() => setExpanded(!expanded)}>
          {expanded ? '收起' : '展开'}
        </button>
        <button style={{ ...secondaryButtonStyle, backgroundColor: '#e74c3c' }} onClick={() => data.onDelete?.(id)}>
          删除
        </button>
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </div>
  );
};

const nodeTypes = { stacked: TaskNode };

const taskTemplates = [
  { label: '主线任务', taskType: '主线', kvs: { 目标: '完成主任务', 奖励: '100金币' } },
  { label: '支线任务', taskType: '支线', kvs: { 目标: '完成支线', 奖励: '50金币' } },
];

export const TaskDesigner: React.FC = () => {
  const flowResource = useResource('act_task_flow');
  const schema = useFieldSchema();
  const schemaUid = schema?.['x-uid'];
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [jsonText, setJsonText] = useState('');
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchFlow = async () => {
      const { data } = await flowResource.get({ filter: { id: schemaUid } });
      if (data?.data?.nodes) setNodes(data.data.nodes);
      if (data?.data?.edges) setEdges(data.data.edges);
    };
    if (schemaUid) fetchFlow();
  }, [schemaUid]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

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

  const layoutPyramid = (nodes: Node[]) => {
    const gapX = 280;
    const gapY = 220;
    const childrenMap = new Map<string, Node[]>();
    nodes.forEach((node) => {
      const parentId = node.data.parentId;
      if (parentId) {
        if (!childrenMap.has(parentId)) childrenMap.set(parentId, []);
        childrenMap.get(parentId)!.push(node);
      }
    });

    const layoutSubtree = (node: Node, depth = 0, startX = 0): number => {
      const children = childrenMap.get(node.id) || [];
      if (children.length === 0) {
        node.position = { x: startX, y: depth * gapY };
        return gapX;
      }
      let totalWidth = 0;
      const childXStart = startX;
      children.forEach((child) => {
        const subtreeWidth = layoutSubtree(child, depth + 1, childXStart + totalWidth);
        totalWidth += subtreeWidth;
      });
      const centerX = childXStart + totalWidth / 2 - gapX / 2;
      node.position = { x: centerX, y: depth * gapY };
      return totalWidth;
    };

    const roots = nodes.filter((n) => !n.data.parentId);
    let cursorX = 0;
    roots.forEach((root) => {
      const subtreeWidth = layoutSubtree(root, 0, cursorX);
      cursorX += subtreeWidth + gapX;
    });
    return [...nodes];
  };

  const addChildNode = (parentId: string) => {
    const parent = nodes.find((n) => n.id === parentId);
    if (!parent) return;
    const children = nodes.filter((n) => n.data.parentId === parentId);
    const newId = `${Date.now()}`;
    const newNode: Node = {
      id: newId,
      type: 'stacked',
      position: { x: parent.position.x, y: parent.position.y + (children.length + 1) * 150 },
      data: {
        label: `子任务${children.length + 1}`,
        taskType: '支线',
        startTime: '2025-05-11',
        endTime: '2025-05-15',
        parentId,
        kvs: { 条件: '依赖父任务' },
        onAddChild: addChildNode,
      },
    };
    const newEdge: Edge = { id: `e${parentId}-${newId}`, source: parentId, target: newId, animated: true };
    setNodes((nds) => layoutPyramid([...nds, newNode]));
    setEdges((eds) => [...eds, newEdge]);
  };

  const addNewTask = (template) => {
    const newId = `${Date.now()}`;
    const newNode: Node = {
      id: newId,
      type: 'stacked',
      position: { x: 100, y: 100 },
      data: {
        label: template.label,
        taskType: template.taskType,
        startTime: '2025-06-01',
        endTime: '2025-06-15',
        parentId: '',
        kvs: template.kvs,
        onAddChild: addChildNode,
      },
    };
    setNodes((nds) => layoutPyramid([...nds, newNode]));
  };

  const deleteNode = (id: string) => {
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    setNodes((nds) => layoutPyramid(nds.filter((n) => n.id !== id)));
  };

  const enhancedNodes = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      onAddChild: addChildNode,
      onDelete: deleteNode,
    },
  }));

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

      // 检查是否存在已有记录
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

  return (
    <div style={{ display: 'flex', height: 800 }}>
      <div style={{ width: 200, background: '#f5f5f5', padding: 10 }}>
        <h4>添加任务</h4>
        {taskTemplates.map((tpl, index) => (
          <button
            key={index}
            style={{ ...buttonStyle, marginBottom: 10, width: '100%' }}
            onClick={() => addNewTask(tpl)}
          >
            {tpl.label}
          </button>
        ))}
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
          nodes={enhancedNodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
        />
      </div>
    </div>
  );
};

const cardStyle: React.CSSProperties = {
  padding: '16px',
  borderRadius: '12px',
  background: '#fff',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  width: '200px',
  fontSize: '12px',
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

const secondaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: '#7b8aaf',
};
