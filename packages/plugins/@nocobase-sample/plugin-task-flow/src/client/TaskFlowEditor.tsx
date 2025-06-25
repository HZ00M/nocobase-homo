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
import { useAPIClient } from '@nocobase/client';
import { TaskDesigner } from './TaskDesigner';
import { TaskMetaProvider, useTaskMetas } from './TaskMetaContext';
import { TaskIdGenerator } from './TaskIdGenerator';
import { useTaskNodes } from './useTaskNodes';
import { ReactFlowProvider } from 'reactflow';
import { AwardMetaProvider, useAwardMetas } from './AwardMetaContext';
const InnerTaskFlowEditor = () => {
  const api = useAPIClient();
  const idGenRef = useRef(new TaskIdGenerator([]));
  const taskNodesApi = useTaskNodes(idGenRef.current); // ✅ 这时 Context 已挂载

  return <TaskDesigner {...taskNodesApi} />;
};

export const TaskFlowEditor = () => {
  return (
    <ReactFlowProvider>
      <TaskMetaProvider>
        <AwardMetaProvider>
          <InnerTaskFlowEditor />
        </AwardMetaProvider>
      </TaskMetaProvider>
    </ReactFlowProvider>
  );
};
