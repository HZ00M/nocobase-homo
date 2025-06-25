/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/server';

export class PluginTaskFlowServer extends Plugin {
  async afterAdd() {}

  async beforeLoad() {}

  async load() {
    this.app.acl.allow('act_task_type', '*', 'public');
    this.app.acl.allow('act_task_flow', '*', 'public');
    // ✅ 注册 REST 资源接口
    for (const name of ['act_task_flow', 'act_task_type']) {
      this.app.resource({ name });
    }
  }

  async install() {}

  async afterEnable() {}

  async afterDisable() {}

  async remove() {}
}

export default PluginTaskFlowServer;
