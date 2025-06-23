/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { createContext, useContext, useRef, useState } from 'react';
import type { TaskMeta } from './types';

export const TaskMetaContext = createContext<{
  taskMetas: TaskMeta[];
  taskMetasRef: React.MutableRefObject<TaskMeta[]>;
  setTaskMetas: (v: TaskMeta[]) => void;
}>(null!);

export const TaskMetaProvider: React.FC = ({ children }) => {
  const [taskMetas, _setTaskMetas] = useState<TaskMeta[]>([]);
  const taskMetasRef = useRef<TaskMeta[]>([]);

  const setTaskMetas = (v: TaskMeta[]) => {
    taskMetasRef.current = v; // 保证 ref 始终更新
    _setTaskMetas(v);
  };

  return (
    <TaskMetaContext.Provider value={{ taskMetas, taskMetasRef, setTaskMetas }}>{children}</TaskMetaContext.Provider>
  );
};

export const useTaskMetas = () => useContext(TaskMetaContext);
