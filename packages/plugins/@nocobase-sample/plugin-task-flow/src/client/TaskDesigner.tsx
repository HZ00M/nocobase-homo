/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useRef } from 'react';
import ReactFlow, { Background, Controls, MiniMap, NodeChange, OnNodesChange } from 'reactflow';
import 'reactflow/dist/style.css';
import { useFieldSchema } from '@formily/react';
import { message, Modal } from 'antd';
import { EditTaskModal } from './EditTaskModal';
import { TaskNode } from './TaskNode';
import { FlowControl } from './FlowControl';
import { useTaskNodesContext } from './TaskNodesContext';
import { getNodeColor } from './CheckIcon';
import TaskSidebar from './TaskSidebarPanel'; // 引入你的枚举
const nodeTypes = { stacked: TaskNode };
export const TaskDesigner: React.FC = () => {
  const {
    nodes,
    setNodes,
    edges,
    setEdges,
    addNewTask,
    onNodesChange,
    onEdgesChange,
    layoutPyramid,
    onNodeSelect,
    getEnhancedNodes,
    importTemplateById,
    resetNodeInfo,
    onConnect,
    onInit,
    selectedNodeId,
    editingNode,
    setEditingNode,
  } = useTaskNodesContext();

  const tmplFetchRef = useRef<() => void>();
  const schema = useFieldSchema();
  const schemaUid = schema?.['x-uid'];
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

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
      <TaskSidebar
        addNewTask={addNewTask}
        importTemplateById={importTemplateById}
        nodes={nodes}
        edges={edges}
        tmplFetchRef={tmplFetchRef}
      />
      <div ref={reactFlowWrapper} style={{ flex: 1, position: 'relative' }}>
        <FlowControl
          clearCanvas={clearCanvas}
          layout={() => setNodes(layoutPyramid(nodes))}
          nodes={nodes}
          setNodes={setNodes}
          edges={edges}
          tmplFetchRef={tmplFetchRef}
        />
        <ReactFlow
          onInit={onInit}
          nodes={getEnhancedNodes()}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          zoomOnDoubleClick={false}
          onNodeClick={(event, node) => {
            if (selectedNodeId) return; // ✅ 禁用点击选中
            event.preventDefault();
            onNodeSelect(node.id);
          }}
          onPaneClick={() => onNodeSelect(null)}
          nodesDraggable={!selectedNodeId}
          elementsSelectable={!selectedNodeId}
          panOnDrag={!selectedNodeId}
          fitView
          attributionPosition="bottom-left"
        >
          <Controls position="top-right" />
          <div style={{ position: 'absolute', bottom: 10, right: 10, zIndex: 100 }}>
            <MiniMap
              zoomable
              pannable
              nodeColor={getNodeColor}
              nodeStrokeColor={(node) => (node.selected ? '#f5222d' : '#999')}
            />
          </div>
          <Background variant={'dots' as any} gap={12} size={1} />
        </ReactFlow>
      </div>

      <EditTaskModal
        visible={!!editingNode}
        node={editingNode}
        onSave={(updatedNode) => {
          setNodes((nds) => nds.map((n) => (n.id === updatedNode.id ? updatedNode : n)));
          setEditingNode(null);
        }}
        onCancel={() => setEditingNode(null)}
      />
    </div>
  );
};
