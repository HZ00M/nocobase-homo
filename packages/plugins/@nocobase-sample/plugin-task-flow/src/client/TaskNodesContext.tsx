/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { createContext, useContext } from 'react';
import { TaskNodeHook, useTaskNodes } from './useTaskNodes';

const TaskNodesContext = createContext<TaskNodeHook | null>(null);

export const TaskNodesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const taskNodes = useTaskNodes();

  return <TaskNodesContext.Provider value={taskNodes}>{children}</TaskNodesContext.Provider>;
};

// 用于任何组件内部访问
export function useTaskNodesContext(): TaskNodeHook {
  const context = useContext(TaskNodesContext);
  if (!context) {
    throw new Error('useTaskNodesContext must be used within a TaskNodesProvider');
  }
  return context;
}
