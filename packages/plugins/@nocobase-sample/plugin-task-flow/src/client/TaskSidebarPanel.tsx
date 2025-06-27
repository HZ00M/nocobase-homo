/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useState } from 'react';
import { TaskMetaOperator } from './TaskMetaOperator';
import { TemplateOperator } from './TemplateOperator';
import { TaskConditionOperator } from './TaskConditionOperator';

const SidebarPanel = ({
  title,
  panelKey,
  activePanels,
  setActivePanels,
  children,
}: {
  title: string;
  panelKey: string;
  activePanels: Set<string>;
  setActivePanels: (newSet: Set<string>) => void;
  children: React.ReactNode;
}) => {
  const isOpen = activePanels.has(panelKey);

  const togglePanel = () => {
    const newSet = new Set(activePanels);
    if (isOpen) {
      newSet.delete(panelKey);
    } else {
      // 如果超过两个，移除第一个已展开的
      if (newSet.size >= 2) {
        const first = newSet.values().next().value;
        newSet.delete(first);
      }
      newSet.add(panelKey);
    }
    setActivePanels(newSet);
  };

  return (
    <div
      style={{
        marginBottom: 12,
        borderRadius: 6,
        border: '1px solid #d9d9d9',
        backgroundColor: '#fff',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s',
      }}
    >
      <div
        onClick={togglePanel}
        style={{
          backgroundColor: isOpen ? '#bae7ff' : '#f0f2f5',
          padding: '10px 12px',
          fontWeight: 500,
          cursor: 'pointer',
          userSelect: 'none',
          borderBottom: '1px solid #d9d9d9',
          flexShrink: 0,
          height: 40,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {title}
      </div>

      <div
        style={{
          height: isOpen ? 300 : 0,
          opacity: isOpen ? 1 : 0,
          transition: 'height 0.3s ease, opacity 0.3s ease',
          overflow: 'hidden',
          padding: isOpen ? '10px 12px' : '0 12px',
        }}
      >
        {children}
      </div>
    </div>
  );
};

const TaskSidebar = ({
  addNewTask,
  importTemplateById,
  nodes,
  edges,
  tmplFetchRef,
}: {
  addNewTask: any;
  importTemplateById: any;
  nodes: any;
  edges: any;
  tmplFetchRef: any;
}) => {
  const [activePanels, setActivePanels] = useState<Set<string>>(new Set(['meta', 'template'])); // 默认展开两个

  return (
    <div
      style={{
        width: 220,
        height: '100%',
        background: '#f5f5f5',
        padding: 10,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <SidebarPanel title="任务面板" panelKey="meta" activePanels={activePanels} setActivePanels={setActivePanels}>
        <div style={{ height: 300, overflow: 'hidden' }}>
          <TaskMetaOperator onAddTask={addNewTask} />
        </div>
      </SidebarPanel>
      <SidebarPanel title="模板面板" panelKey="template" activePanels={activePanels} setActivePanels={setActivePanels}>
        <div style={{ height: 300, overflow: 'hidden' }}>
          <TemplateOperator
            onSelect={importTemplateById}
            nodes={nodes}
            edges={edges}
            onRefetch={(refetchFn) => {
              tmplFetchRef.current = refetchFn;
            }}
          />
        </div>
      </SidebarPanel>
      <SidebarPanel title="条件面板" panelKey="condition" activePanels={activePanels} setActivePanels={setActivePanels}>
        <div style={{ height: 300, overflow: 'hidden' }}>
          <TaskConditionOperator />
        </div>
      </SidebarPanel>
    </div>
  );
};

export default TaskSidebar;
