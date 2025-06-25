/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useState } from 'react';
import { Modal, Button, Input, Form, message } from 'antd';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import type { Node } from 'reactflow';
import { TaskData } from './types';

interface ExportTaskNodeExcelProps {
  nodes: Node<TaskData>[];
}

const ExportTaskNodeExcel: React.FC<ExportTaskNodeExcelProps> = ({ nodes }) => {
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();

  const fieldKeys = [
    'id',
    'activityId',
    'parentTaskId',
    'promiseTaskId',
    'taskId',
    'nodeType',
    'taskType',
    'targetProcess',
    'weight',
    'condition',
    'rewardType',
    'reward',
    'desc',
    'sortId',
    'timeType',
    'startTime',
    'endTime',
    'startTimeStr',
    'endTimeStr',
    'offsetTime',
    'extraInfo',
  ];

  const fieldTypes = [
    'int',
    'string',
    'string',
    'string',
    'string',
    'string',
    'string',
    'int',
    'int',
    'string',
    'string',
    'string',
    'string',
    'int',
    'int',
    'long',
    'long',
    'string',
    'string',
    'long',
    'string',
  ];

  const fieldLabels = [
    '下标',
    '活动id',
    '父任务id',
    '前置任务id',
    '任务id',
    '节点类型',
    '任务条件类型',
    '达成值',
    '任务权重',
    '条件',
    '奖励类型',
    '任务奖励',
    '任务描述',
    '任务排序',
    '时间开启类型',
    '开始时间',
    '结束时间',
    '开启时间',
    '结算时间',
    '偏移时间/秒',
    '额外信息',
  ];

  const handleExport = async () => {
    try {
      const { fileName, activityId } = await form.validateFields();

      if (nodes.length === 0) {
        message.warning('没有可导出的节点数据');
        return;
      }

      const dataRows = nodes.map((node, index) => {
        const data = {
          ...node.data,
          id: index + 1, // 序号作为 id（K）
          activityId, // 统一 activityId
          extraInfo: JSON.stringify(node.data.extraInfo), // 额外信息转为 JSON 字符串
        };

        return fieldKeys.map((key) => data[key] ?? '');
      });

      const sheetData = [fieldKeys, fieldTypes, fieldLabels, ...dataRows];

      const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '任务节点');

      const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `${fileName || '任务节点'}.xlsx`);

      message.success('导出成功');
      setVisible(false);
    } catch (err: any) {
      message.error('导出失败：' + (err.message || err));
    }
  };

  return (
    <>
      <Button type="primary" onClick={() => setVisible(true)}>
        导出配置
      </Button>
      <Modal
        title="导出节点数据"
        open={visible}
        onCancel={() => setVisible(false)}
        onOk={handleExport}
        okText="导出"
        destroyOnClose
      >
        <Form layout="vertical" form={form}>
          <Form.Item label="导出文件名" name="fileName" rules={[{ required: true, message: '请输入导出文件名' }]}>
            <Input placeholder="例如：task_nodes.xlsx" />
          </Form.Item>
          <Form.Item label="活动 ID" name="activityId" rules={[{ required: true, message: '请输入活动 ID' }]}>
            <Input placeholder="例如：80001" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ExportTaskNodeExcel;
