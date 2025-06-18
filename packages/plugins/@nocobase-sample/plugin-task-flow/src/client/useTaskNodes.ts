/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

// useTaskNodes.ts
import { useState } from 'react';
import type { TaskMeta, TaskData } from './types';
import ReactFlow, { Connection, useNodesState, useEdgesState, addEdge, Node, Edge } from 'reactflow';
import { message } from 'antd';
import { useResource } from '@nocobase/client';
import { TaskIdGenerator } from './TaskIdGenerator';

export function useTaskNodes(initialNodes: Node[], initialEdges: Edge[]) {
  const flowResource = useResource('act_task_flow');
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const idGen = new TaskIdGenerator(nodes); // 初始化计数器
  // 新增选中节点id状态
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const layoutPyramid = (nodes: Node[]) => {
    const gapX = 280;
    const gapY = 220;
    const childrenMap = new Map<string, Node[]>();
    nodes.forEach((node) => {
      const parentId = node.data.parentTaskId;
      if (parentId) {
        if (!childrenMap.has(parentId)) childrenMap.set(parentId, []);
        childrenMap.get(parentId)!.push(node);
      }
    });

    const layoutSubtree = (node: Node, depth = 0, startX = 0, visited = new Set<string>()): number => {
      if (visited.has(node.id)) {
        console.warn(`检测到环，跳过节点 ${node.id} 的重复布局`);
        // 避免无限递归，直接返回0宽度，或者可以返回gapX
        return 0;
      }
      visited.add(node.id);

      const children = childrenMap.get(node.id) || [];
      if (children.length === 0) {
        node.position = { x: startX, y: depth * gapY };
        return gapX;
      }
      let totalWidth = 0;
      const childXStart = startX;
      children.forEach((child) => {
        totalWidth += layoutSubtree(child, depth + 1, childXStart + totalWidth, new Set(visited));
      });
      const centerX = childXStart + totalWidth / 2 - gapX / 2;
      node.position = { x: centerX, y: depth * gapY };
      return totalWidth;
    };

    const roots = nodes.filter((n) => !n.data.parentTaskId);
    let cursorX = 0;
    roots.forEach((root) => {
      const subtreeWidth = layoutSubtree(root, 0, cursorX);
      cursorX += subtreeWidth + gapX;
    });
    return [...nodes];
  };
  const addNewTask = (parentId?: string, taskMeta?: TaskMeta) => {
    if (taskMeta === undefined) {
      taskMeta = {
        value: 'Task',
        desc: '默认子任务',
      };
    }
    const taskType = taskMeta.value;
    // 使用传入的 parentId，如果没传再用当前选中的节点
    const resolvedParentId = parentId ?? selectedNodeId;
    const sameTypeCount = nodes.filter((n) => n.data?.taskType === taskType).length;
    const incr = idGen.next(taskType);
    const newId = `${taskType}_${incr}`;
    const newNode: Node<TaskData> = {
      id: newId,
      type: 'stacked',
      position: { x: 100, y: 100 },
      data: {
        meta: taskMeta,
        label: `${taskMeta.type || '任务'}_${incr}`,
        activityId: '',
        parentTaskId: resolvedParentId ?? '',
        promiseTaskId: '',
        taskId: newId,
        nodeType: '',
        taskType: taskType,
        targetProcess: 0,
        weight: 0,
        condition: '',
        rewardType: '',
        reward: '',
        desc: '',
        sortId: 0,
        timeType: 0,
        startTime: '2025-06-01',
        endTime: '2025-06-15',
        offsetTime: 0,
        extraInfo: {},
        // onAddChild: addNewTask,
        // onDelete: deleteNode,
        // onSelect: onNodeSelect,
      },
    };

    setNodes((nds) => layoutPyramid([...nds, newNode]));

    // 添加连线
    if (resolvedParentId) {
      const newEdge: Edge = {
        id: `edge-${incr}`,
        source: resolvedParentId,
        target: newId,
        type: 'default',
        animated: true,
      };
      setEdges((eds) => [...eds, newEdge]);
    }

    setSelectedNodeId(newId);
  };

  const getEnhancedNodes = () => {
    return nodes.map((node) => ({
      ...node,
      selected: node.id === selectedNodeId,
      data: {
        ...node.data,
        onAddChild: addNewTask,
        onDelete: deleteNode,
        onSelect: () => onNodeSelect(node.id),
      },
    }));
  };

  const deleteNode = (id: string) => {
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    setNodes((nds) => {
      const filtered = nds.filter((n) => n.id !== id);
      // 如果删除了选中节点，清空选中
      if (selectedNodeId === id) {
        setSelectedNodeId(null);
      }
      return layoutPyramid(filtered);
    });
  };

  const importTemplateById = async (templateId: string) => {
    try {
      const { data } = await flowResource.get({ filter: { id: templateId } });
      const tplNodes: Node<TaskData>[] = data?.data?.nodes || [];
      const tplEdges: Edge[] = data?.data?.edges || [];
      // 找出模板中的根节点（没有 parentTaskId）
      const tplRootNode = tplNodes.find((n) => !n.data.parentTaskId || n.data.parentTaskId === '');
      const idMap = new Map<string, number>();

      // 生成新 ID 映射
      tplNodes.forEach((node, i) => {
        const newId = idGen.nextId(node.data.taskType);
        idMap.set(node.id, newId);
      });

      const newNodes = tplNodes.map((node) => ({
        ...node,
        id: idMap.get(node.id)!,
        position: {
          x: (node.position?.x || 0) + 100,
          y: (node.position?.y || 0) + 100,
        },
        data: {
          ...node.data,
          id: idMap.get(node.id)!,
          taskId: idMap.get(node.id)!,
          parentTaskId: node.data.parentTaskId ? idMap.get(node.data.parentTaskId)! : selectedNodeId || '', // 挂载或不挂载
        },
      }));

      const newEdges = tplEdges.map((edge) => ({
        ...edge,
        id: `edge-${idMap.get(edge.source)}-${idMap.get(edge.target)}`,
        source: idMap.get(edge.source)!,
        target: idMap.get(edge.target)!,
        animated: true,
      }));

      // 如果当前有选中节点且找到根节点，添加一条新边连接两者
      if (selectedNodeId && tplRootNode) {
        newEdges.push({
          id: `edge-${selectedNodeId}-${tplRootNode.id}`,
          source: selectedNodeId,
          target: idMap.get(tplRootNode.id),
          type: 'default',
          animated: true,
        });
      }
      // 合并并重新布局
      setNodes((nds) => layoutPyramid([...nds, ...newNodes]));
      setEdges((eds) => [...eds, ...newEdges]);

      if (selectedNodeId) {
        message.success('模板成功挂为子节点');
      } else {
        message.success('模板成功自由插入');
      }
    } catch (err) {
      console.error('导入模板失败', err);
      message.error('导入模板失败');
    }
  };
  // 新增选中节点处理函数
  const onNodeSelect = (id: string | null) => {
    setSelectedNodeId(id);
  };
  const resetNodeInfo = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    idGen.reset();
    console.log('重置节点信息');
  };
  // 加到 useTaskNodes 返回值中
  const onConnect = (connection: Connection) => {
    const { source, target } = connection;

    if (!source || !target) return;

    const newEdge: Edge = {
      ...connection,
      id: `edge-${source}-${target}`,
      animated: true,
      type: 'default',
    };

    // 添加边
    setEdges((eds) => [...eds, newEdge]);

    /// 仅更新目标节点的 parentTaskId，不重新布局
    setNodes((nds) =>
      nds.map((node) =>
        node.id === target
          ? {
              ...node,
              data: {
                ...node.data,
                parentTaskId: source,
              },
            }
          : node,
      ),
    );
  };

  return {
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
  };
}
