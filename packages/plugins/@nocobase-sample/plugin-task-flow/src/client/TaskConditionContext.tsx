/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { createContext, useContext, useRef, useState } from 'react';

export interface TaskCondition {
  id: number;
  operator: string;
  conditionType: string;
  value: string;
  desc: string;
}

export const TaskConditionContext = createContext<{
  taskConditions: TaskCondition[];
  taskConditionsRef: React.MutableRefObject<TaskCondition[]>;
  setTaskConditions: (v: TaskCondition[]) => void;
}>(null!);

export const TaskConditionProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [taskConditions, _setTaskConditions] = useState<TaskCondition[]>([]);
  const taskConditionsRef = useRef<TaskCondition[]>([]);

  const setTaskConditions = (v: TaskCondition[]) => {
    taskConditionsRef.current = v; // 保证 ref 始终最新
    _setTaskConditions(v);
  };

  return (
    <TaskConditionContext.Provider value={{ taskConditions, taskConditionsRef, setTaskConditions }}>
      {children}
    </TaskConditionContext.Provider>
  );
};

export const useTaskConditions = () => useContext(TaskConditionContext);
