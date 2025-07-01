/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React from 'react';
import 'reactflow/dist/style.css';
import { uid } from '@formily/shared';
import { ISchema, SchemaInitializerItemType, SchemaSettings, useSchemaInitializer } from '@nocobase/client';
import { useT } from './locale';
import { TaskFlowEditor } from './TaskFlowEditor';

export const FlowDataComponentName = 'TaskDataComponent';
export const DataSettings = new SchemaSettings({
  name: `blockSettings:${FlowDataComponentName}`,
  items: [
    {
      type: 'remove',
      name: 'remove',
      componentProps: {
        removeParentsIfNoChildren: true,
        breakRemoveOn: { 'x-component': 'Grid' },
      },
    },
  ],
});
export const TaskDesignerSchema: ISchema = {
  type: 'void',
  name: uid(),
  'x-component': 'CardItem',
  'x-use-decorator-props': 'useDynamicDataBlockProps',
  'x-settings': DataSettings.name,
  properties: {
    [FlowDataComponentName]: {
      'x-uid': uid(), //  👈 这个 uid 应该被 TaskDesigner 读取
      'x-component': FlowDataComponentName,
    },
  },
};
export const DataInitializerItem: SchemaInitializerItemType = {
  type: 'item',
  name: FlowDataComponentName,
  icon: 'FileImageOutlined',
  useComponentProps() {
    const { insert } = useSchemaInitializer();
    const t = useT();
    return {
      title: t(FlowDataComponentName),
      onClick: () => insert(TaskDesignerSchema),
    };
  },
};
export const TaskDataComponent: React.FC = () => {
  return <TaskFlowEditor />;
};
