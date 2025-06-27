/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React from 'react';
import { SaveTemplateButton } from './SaveTemplateButton';
import { CheckNodesButton } from './CheckNodesButton';
import { Button, Space } from 'antd';
import ExportTaskNodeExcel from './ExportTaskNodeExcel';

export const FlowControl = ({ clearCanvas, layout, nodes, setNodes, edges, tmplFetchRef }) => {
  return (
    <div
      style={{
        padding: 16,
        background: '#fff',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        borderBottom: '1px solid #eee',
        userSelect: 'none',
      }}
    >
      {/* 按钮组 */}
      <Space wrap size="middle">
        <Button type="primary" ghost onClick={clearCanvas}>
          清空画布
        </Button>
        <Button type="primary" ghost onClick={layout}>
          重新布局
        </Button>
        <SaveTemplateButton nodes={nodes} edges={edges} tmplFetchRef={tmplFetchRef} />
        <CheckNodesButton nodes={nodes} setNodes={setNodes} />
        <ExportTaskNodeExcel nodes={nodes} />
      </Space>
    </div>
  );
};
