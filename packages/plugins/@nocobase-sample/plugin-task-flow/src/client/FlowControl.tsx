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
import { Button, Space } from 'antd';
import ExportTaskNodeExcel from './ExportTaskNodeExcel';

export const FlowControl = ({ clearCanvas, exportToJson, importFromJson, layout, nodes, edges, tmplFetchRef }) => {
  const commonBtnProps = {
    size: 'middle',
    shape: 'round', // 圆角按钮
  };

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
        <Button type="primary" {...commonBtnProps} onClick={clearCanvas}>
          清空画布
        </Button>
        <Button type="default" {...commonBtnProps} onClick={exportToJson}>
          导出 JSON
        </Button>
        <Button type="default" {...commonBtnProps} onClick={importFromJson}>
          导入 JSON
        </Button>
        <Button type="default" {...commonBtnProps} onClick={layout}>
          重新布局
        </Button>
        <SaveTemplateButton nodes={nodes} edges={edges} tmplFetchRef={tmplFetchRef} />
        <ExportTaskNodeExcel nodes={nodes} />
      </Space>
    </div>
  );
};
