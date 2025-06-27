/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

// TaskFlowEditor.tsx
import React, { useRef, useEffect } from 'react';
import { TaskDesigner } from './TaskDesigner';
import { TaskMetaProvider, useTaskMetas } from './TaskMetaContext';
import { ReactFlowProvider } from 'reactflow';
import { AwardMetaProvider, useAwardMetas } from './AwardMetaContext';
import { TaskNodesProvider } from './TaskNodesContext';

export const TaskFlowEditor = () => {
  return (
    <ReactFlowProvider>
      <TaskMetaProvider>
        <TaskNodesProvider>
          <AwardMetaProvider>
            <TaskDesigner />
          </AwardMetaProvider>
        </TaskNodesProvider>
      </TaskMetaProvider>
    </ReactFlowProvider>
  );
};
