/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React from 'react';
import { Button } from 'antd';
import type { Node } from 'reactflow';
import type { TaskData } from './types';
import { CheckItem } from './CheckIcon';
import { checkRules } from './CheckRule';

interface Props {
  nodes: Node<TaskData>[];
  setNodes: (nodes: Node<TaskData>[]) => void;
}

export const CheckNodesButton: React.FC<Props> = ({ nodes, setNodes }) => {
  const checkAllNodes = () => {
    const updatedNodes = nodes.map((node) => {
      const checkList: CheckItem[] = [];
      for (const rule of checkRules) {
        checkList.push(...rule.apply(node, nodes));
      }
      const nodeCheckResult = {
        list: checkList,
      };
      return {
        ...node,
        data: {
          ...node.data,
          checkResult: nodeCheckResult,
        },
      };
    });
    setNodes(updatedNodes);
  };

  return (
    <Button ghost onClick={checkAllNodes} type="primary">
      检查配置
    </Button>
  );
};
