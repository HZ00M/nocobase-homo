/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/client';
import { DataInitializerItem, DataSettings, FlowDataComponentName, TaskDataComponent } from './FlowDataComponent';

export class PluginLogicFlowTestClient extends Plugin {
  async afterAdd() {}

  async beforeLoad() {}
  async load() {
    this.registerFlowData();
    this.app.router.add('task', {
      path: '/task',
      Component: TaskDataComponent,
    });
  }

  registerFlowData() {
    this.app.addComponents({ [FlowDataComponentName]: TaskDataComponent });
    this.app.schemaSettingsManager.add(DataSettings);
    this.app.schemaInitializerManager.addItem(
      'page:addBlock',
      `otherBlocks.${DataInitializerItem.name}`,
      DataInitializerItem,
    );
    this.app.schemaInitializerManager.addItem(
      'popup:addNew:addBlock',
      `otherBlocks.${DataInitializerItem.name}`,
      DataInitializerItem,
    );
  }
}
export default PluginLogicFlowTestClient;
