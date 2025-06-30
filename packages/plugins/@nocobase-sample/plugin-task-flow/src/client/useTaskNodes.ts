/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import type { TaskMeta, TaskData } from './types';
import ReactFlow, { Connection, useNodesState, useEdgesState, addEdge, Node, Edge, ReactFlowInstance } from 'reactflow';
import { message, Modal } from 'antd';
import { useResource } from '@nocobase/client';
import { TaskIdGenerator } from './TaskIdGenerator';
import { v4 as uuidv4 } from 'uuid';
import { deepMergeSources } from './utils';
import { taskNodeTemplate } from './constants';
import { useTaskMetas } from './TaskMetaContext';

export type UseTaskNodes = ReturnType<typeof useTaskNodes>;

export function useTaskNodes() {
  const idGenRef = useRef<TaskIdGenerator>(new TaskIdGenerator());
  const { taskMetasRef } = useTaskMetas();
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance>();
  const flowResource = useResource('act_task_flow');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  // ReactFlow 初始化时设置实例
  const onInit = (instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
  };
  const nodeOptions = useMemo(() => {
    return nodes
      .filter((n) => n.data?.taskId)
      .map((n) => ({
        label: n.data.taskId,
        value: n.data.taskId,
      }));
  }, [nodes]);
  const highlightNode = (nodeId: string) => {
    const targetNode = nodes.find((n) => n.id === nodeId);
    if (targetNode && reactFlowInstance) {
      reactFlowInstance.setCenter(targetNode.position.x, targetNode.position.y, {
        zoom: 1.5,
        duration: 500,
      });
      setNodes((nds) => nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, highlight: true } } : n)));

      // 去除高亮
      setTimeout(() => {
        setNodes((nds) => nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, highlight: false } } : n)));
      }, 3000);
    }
  };

  const layoutPyramid = (allNodes: Node[]): Node[] => {
    const gapX = 280;
    const gapY = 300;

    // 用 Map 复制每个节点，避免原始引用修改污染隐藏节点
    const nodeMap = new Map<string, Node>();
    allNodes.forEach((n) => nodeMap.set(n.id, { ...n, position: { ...n.position } }));

    const visibleNodes = Array.from(nodeMap.values()).filter((node) => !node.hidden);

    const childrenMap = new Map<string, Node[]>();
    for (const node of visibleNodes) {
      const parentId = node.data.parentId;
      if (parentId) {
        if (!childrenMap.has(parentId)) {
          childrenMap.set(parentId, []);
        }
        childrenMap.get(parentId)!.push(node);
      }
    }

    const layoutSubtree = (node: Node, depth = 0, startX = 0): number => {
      const nodeId = node.id;
      const children = childrenMap.get(nodeId) || [];
      if (children.length === 0) {
        node.position = { x: startX, y: depth * gapY };
        return gapX;
      }

      let totalWidth = 0;
      const childXStart = startX;
      for (const child of children) {
        totalWidth += layoutSubtree(child, depth + 1, childXStart + totalWidth);
      }

      const centerX = childXStart + totalWidth / 2 - gapX / 2;
      node.position = { x: centerX, y: depth * gapY };
      return totalWidth;
    };

    const roots = visibleNodes.filter((n) => !n.data.parentId || !nodeMap.has(n.data.parentId));

    let cursorX = 0;
    for (const root of roots) {
      const subtreeWidth = layoutSubtree(root, 0, cursorX);
      cursorX += subtreeWidth + gapX;
    }

    // 返回新的节点列表（保留 hidden 节点位置不动）
    return allNodes.map((n) => {
      const updated = nodeMap.get(n.id);
      return updated ? { ...n, position: updated.position } : n;
    });
  };
  const addNewTask = (parentId?: string, taskMeta?: TaskMeta) => {
    if (taskMeta === undefined) {
      taskMeta = {
        value: 'Task',
        desc: '默认子任务',
      };
    }
    const nodeType = taskMeta.value;
    // 操作节点ID
    const operationNodeId = parentId ?? selectedNodeId;
    const sameTypeCount = nodes.filter((n) => n.data?.nodeType === nodeType).length;
    const incr = idGenRef.current.next(nodeType);
    const taskId = `${nodeType}_${incr}`;
    const newId = uuidv4();
    const parentNode = nodes.find((n) => n.id === operationNodeId);

    // 先确保操作节点展开（折叠则展开）
    setNodes((prevNodes) => {
      const updatedNodes = prevNodes.map((n) => {
        if (n.id === operationNodeId && n.data.collapsed) {
          return {
            ...n,
            data: { ...n.data, collapsed: false },
            hidden: false, // 确保展开时显示
          };
        }
        return n;
      });
      const newNode: Node<TaskData> = deepMergeSources(taskNodeTemplate, {
        id: newId,
        data: {
          label: taskId,
          parentId: operationNodeId,
          meta: taskMeta,
          taskId: taskId,
          parentTaskId: parentNode?.data?.taskId || '',
          nodeType: taskMeta.value,
        },
      });
      return layoutPyramid([...updatedNodes, newNode]);
    });

    // 添加新连线
    if (operationNodeId) {
      const newEdge: Edge = {
        id: `edge-${operationNodeId}-${newId}`,
        source: operationNodeId,
        target: newId,
        type: 'default',
        animated: true,
      };
      setEdges((eds) => [...eds, newEdge]);
    }
    setSelectedNodeId(operationNodeId);
  };

  const toggleCollapse = (nodeId: string) => {
    // 建立父节点 -> 直接子节点 映射
    const childMap = new Map<string, string[]>();
    edges.forEach((edge) => {
      if (!childMap.has(edge.source)) childMap.set(edge.source, []);
      childMap.get(edge.source)!.push(edge.target);
    });

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    const collapsed = !node.data.collapsed;

    // 递归拿到所有后代节点id（整棵子树）
    const getAllDescendants = (id: string, visited = new Set<string>()): string[] => {
      if (visited.has(id)) return [];
      visited.add(id);
      const children = childMap.get(id) || [];
      let result: string[] = [];
      for (const childId of children) {
        result.push(childId);
        result = result.concat(getAllDescendants(childId, visited));
      }
      return result;
    };

    const allDescendants = getAllDescendants(nodeId);
    const directChildren = childMap.get(nodeId) || [];

    // 更新节点显示状态
    setNodes((prevNodes) => {
      const newNodes = prevNodes.map((n) => {
        if (n.id === nodeId) {
          // 当前节点状态切换collapsed
          return {
            ...n,
            data: { ...n.data, collapsed },
            hiddenByParentCollapse: false,
            hidden: false,
          };
        }
        if (allDescendants.includes(n.id)) {
          if (collapsed) {
            // 折叠：所有后代隐藏
            return { ...n, hiddenByParentCollapse: true, hidden: true };
          } else {
            // 展开：只显示直接子节点，其他隐藏
            if (directChildren.includes(n.id)) {
              return { ...n, hiddenByParentCollapse: false, hidden: false };
            }
            return { ...n, hiddenByParentCollapse: true, hidden: true };
          }
        }
        // 不受影响的节点保持不变
        return n;
      });
      return layoutPyramid(newNodes);
    });

    // 更新边显示状态
    setEdges((prevEdges) => {
      const newEdges = prevEdges.map((edge) => {
        if (collapsed) {
          // 折叠：所有子树边隐藏
          if (allDescendants.includes(edge.source) || allDescendants.includes(edge.target)) {
            return { ...edge, hidden: true };
          }
        } else {
          // 展开：只显示连接当前节点和直接子节点的边
          if (edge.source === nodeId && directChildren.includes(edge.target)) {
            return { ...edge, hidden: false };
          }
          if (allDescendants.includes(edge.source) || allDescendants.includes(edge.target)) {
            return { ...edge, hidden: true };
          }
        }
        return edge;
      });
      return newEdges;
    });

    setSelectedNodeId(nodeId);
  };
  const onOpenEditModal = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId) || null;
    setEditingNode(node);
  };

  const setNodeField = (nodeId: string, fieldName: string, value: string) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              data: {
                ...n.data,
                [fieldName]: value,
              },
            }
          : n,
      ),
    );
  };

  const getEnhancedNodes = () => {
    return nodes.map((node) => ({
      ...node,
      selected: node.id === selectedNodeId,
      data: {
        ...node.data,
        onAddChild: addNewTask,
        onEdit: () => onOpenEditModal(node.id),
        onDelete: () => deleteNodeWithConfirm(node.id),
        onSelect: () => onNodeSelect(node.id),
        onToggleCollapse: () => toggleCollapse(node.id),
        onCheck: highlightNode,
        setNodeField, // 提供字段更新函数
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
  // 递归获取所有后代节点id
  const getAllDescendants = (id: string, childMap: Map<string, string[]>, visited = new Set<string>()): string[] => {
    if (visited.has(id)) return [];
    visited.add(id);
    const children = childMap.get(id) || [];
    const result = [...children];
    for (const childId of children) {
      result.push(...getAllDescendants(childId, childMap, visited));
    }
    return result;
  };

  const deleteNodeWithConfirm = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确认删除该节点及其所有子节点吗？此操作不可撤销。',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        // 先构建 childMap 用于查找子孙节点
        const childMap = new Map<string, string[]>();
        for (const edge of edges) {
          if (!childMap.has(edge.source)) {
            childMap.set(edge.source, []);
          }
          childMap.get(edge.source)!.push(edge.target);
        }
        // 获取所有后代节点id
        const descendants = getAllDescendants(id, childMap);
        // 包括自己一起删除
        const toDeleteIds = new Set([id, ...descendants]);

        // 删除节点
        setNodes((nds) => {
          const filtered = nds.filter((n) => !toDeleteIds.has(n.id));
          // 如果删除了选中节点，清空选中
          if (selectedNodeId && toDeleteIds.has(selectedNodeId)) {
            setSelectedNodeId(null);
          }
          return layoutPyramid(filtered);
        });

        // 删除边
        setEdges((eds) => eds.filter((e) => !toDeleteIds.has(e.source) && !toDeleteIds.has(e.target)));
      },
    });
  };
  const importTemplateById = async (templateId: string) => {
    try {
      const { data } = await flowResource.get({ filter: { id: templateId } });
      const tplNodes: Node<TaskData>[] = data?.data?.nodes || [];
      const tplEdges: Edge[] = data?.data?.edges || [];

      const idMap = new Map<string, string>();
      const taskIdMap = new Map<string, string>();
      const tplTaskIdSet = new Set(tplNodes.map((n) => n.data.taskId));

      // 新 ID 映射
      tplNodes.forEach((node) => {
        const newNodeId = uuidv4();
        const incr = idGenRef.current.next(node.data.nodeType);
        const newTaskId = `${node.data.nodeType}_${incr}`;
        idMap.set(node.id, newNodeId);
        taskIdMap.set(node.data.taskId, newTaskId);
      });

      const parentNode = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : null;
      const parentCollapsed = parentNode?.data.collapsed === true;

      const newNodes = tplNodes.map((node) => {
        const oldId = node.id;
        const newId = idMap.get(oldId)!;
        const newTaskId = taskIdMap.get(node.data.taskId)!;

        const isRootOfTemplate = !tplTaskIdSet.has(node.data.parentTaskId);
        const newParentId = isRootOfTemplate && selectedNodeId ? selectedNodeId : idMap.get(node.data.parentId!) || '';
        const newParentTaskId =
          isRootOfTemplate && selectedNodeId
            ? parentNode?.data.taskId || ''
            : taskIdMap.get(node.data.parentTaskId!) || '';

        const taskMeta = taskMetasRef.current.find((meta) => meta.value === node.data.nodeType);

        const shouldHide = parentCollapsed && !isRootOfTemplate;

        return {
          ...node,
          id: newId,
          position: {
            x: (node.position?.x || 0) + 100,
            y: (node.position?.y || 0) + 100,
          },
          data: {
            ...node.data,
            taskId: newTaskId,
            parentId: newParentId,
            parentTaskId: newParentTaskId,
            meta: taskMeta ?? {
              value: 'Task',
              type: 'unknown',
              desc: '未知任务',
              mark: '',
            },
            collapsed: false,
            hiddenByParentCollapse: shouldHide,
          },
          hidden: shouldHide,
        };
      });

      const newEdges = tplEdges.map((edge) => ({
        ...edge,
        id: `edge-${idMap.get(edge.source)}-${idMap.get(edge.target)}`,
        source: idMap.get(edge.source)!,
        target: idMap.get(edge.target)!,
        animated: true,
        type: 'default',
        hidden: parentCollapsed,
      }));

      // 自动连线模板根节点与当前选中节点
      const newTaskIdToNodeMap = new Map(newNodes.map((n) => [n.data.taskId, n]));
      const tplRoot = newNodes.find((n) => {
        return !tplTaskIdSet.has(n.data.parentTaskId); // 确保 parentTaskId 不在模板内
      });

      if (tplRoot && selectedNodeId) {
        newEdges.push({
          id: `edge-${selectedNodeId}-${tplRoot.id}`,
          source: selectedNodeId,
          target: tplRoot.id,
          type: 'default',
          animated: true,
          hidden: parentCollapsed,
        });
      }

      setNodes((nds) => layoutPyramid([...nds, ...newNodes]));
      setEdges((eds) => [...eds, ...newEdges]);

      message.success(selectedNodeId ? '模板成功挂为子节点' : '模板成功自由插入');
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
    idGenRef.current.reset();
    console.log('重置节点信息');
  };
  const onConnect = (connection: Connection) => {
    const { source, target } = connection;

    if (!source || !target) return;

    // 获取 source 对应的 node，以便取出 taskId
    const sourceNode = nodes.find((n) => n.id === source);
    const sourceTaskId = sourceNode?.data?.taskId;

    if (!sourceTaskId) {
      console.warn(`无法从源节点 ${source} 获取 taskId`);
      return;
    }

    const newEdge: Edge = {
      ...connection,
      id: `edge-${source}-${target}`,
      animated: true,
      type: 'default',
    };

    // 添加边
    setEdges((eds) => [...eds, newEdge]);

    // 更新目标节点的 parentTaskId（逻辑连接）
    setNodes((nds) =>
      nds.map((node) =>
        node.id === target
          ? {
              ...node,
              data: {
                ...node.data,
                parentId: source,
                parentTaskId: sourceTaskId,
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
    onOpenEditModal,
    setEditingNode,
    setNodeField,
    nodeOptions,
  };
}
