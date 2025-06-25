/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useEffect, useState, useMemo } from 'react';
import {
  message,
  Card,
  Modal,
  Form,
  Tooltip,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Row,
  Col,
  Space,
  Button,
} from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import type { Node } from 'reactflow';
import type { TaskData, TaskMeta } from './types';
import dayjs from 'dayjs';
import { TimeType, TimeStartTypeOptions } from './constants';
import { TextArea } from '@nocobase/client/src/schema-component/antd/variable/TextArea';
import { useTaskMetas } from './TaskMetaContext';
import { useAwardMetas } from './AwardMetaContext';
import { formatSecondsToDHMS } from './utils';

const { RangePicker } = DatePicker;

interface EditTaskModalProps {
  visible: boolean;
  node: Node<TaskData> | null;
  onSave: (node: Node<TaskData>) => void;
  onCancel: () => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({ visible, node, onSave, onCancel }) => {
  const { taskMetas } = useTaskMetas();
  const { awardMetas } = useAwardMetas();
  const nodeTypeOptions = taskMetas.map((item) => ({
    label: item.value,
    value: item.value,
  }));
  const [form] = Form.useForm();
  const [offsetDisplay, setOffsetDisplay] = useState('-');
  const [selectedTaskMeta, setSelectedTaskMeta] = useState<TaskMeta | null>(null);
  const [selectedAwardMeta, setSelectedAwardMeta] = useState<TaskMeta | null>(null);
  const [extraInfoFields, setExtraInfoFields] = useState<any[]>([]);
  const timeType = Form.useWatch('timeType', form);
  const offsetTime = Form.useWatch('offsetTime', form);
  const timeRange = Form.useWatch('timeRange', form);
  const startDay = Form.useWatch('startDay', form);
  const endDay = Form.useWatch('endDay', form);
  const nodeType = Form.useWatch('nodeType', form);
  const rewardType = Form.useWatch('rewardType', form);
  // 监听偏移相关字段变化，更新偏移显示
  useEffect(() => {
    const timeout = setTimeout(() => {
      setOffsetDisplay(calcOffsetDates());
    }, 100); // 避免字段还没设置完
    return () => clearTimeout(timeout);
  }, [timeType, offsetTime, timeRange, startDay, endDay]);
  const formFieldKeys = [
    'label',
    'desc',
    'nodeType',
    'sortId',
    'taskType',
    'targetProcess',
    'condition',
    'weight',
    'timeType',
    'startDay',
    'endDay',
    'timeRange',
    'offsetTime',
    'rewardType',
    'reward',
  ];
  const [requiredKeys, setRequiredKeys] = useState<string[]>([]);

  function getRequireFields(taskMeta?: TaskMeta): string[] {
    const raw = taskMeta?.requireField;
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw);
      } catch {
        return [];
      }
    }
    return Array.isArray(raw) ? raw : [];
  }

  useEffect(() => {
    if (node) {
      const { data } = node;
      form.setFieldsValue({
        ...data,
        timeRange: data.startTime && data.endTime ? [dayjs(data.startTime), dayjs(data.endTime)] : undefined,
      });

      if (data.extraInfo) {
        const allKeys = Object.keys(data.extraInfo || {});
        const taskMeta = taskMetas.find((item) => item.value === data.nodeType) || null;
        const awardMeta = awardMetas.find((item) => item.value === data.rewardType) || null;
        setSelectedTaskMeta(taskMeta);
        setSelectedAwardMeta(awardMeta);

        const requireFields1 = getRequireFields(taskMeta);
        const requireFields2 = getRequireFields(awardMeta);
        const allRequireFields = Array.from(new Set([...(requireFields1 || []), ...(requireFields2 || [])]));
        setRequiredKeys(allRequireFields);
        const fixedKeys = allRequireFields.filter((key) => allKeys.includes(key));

        // dynamic 字段 = allKeys - 固定字段 - 预设的form字段
        const dynamicKeys = allKeys.filter((key) => !formFieldKeys.includes(key) && !fixedKeys.includes(key));

        // 给 form 赋值
        const fixedValueObj: Record<string, any> = {};
        fixedKeys.forEach((key) => {
          fixedValueObj[key] = data.extraInfo[key];
        });

        const dynamicValueArr = dynamicKeys.map((key) => ({
          key,
          value: data.extraInfo[key],
        }));

        form.setFieldValue(['extraInfo', 'fixed'], fixedValueObj);
        form.setFieldValue(['extraInfo', 'dynamic'], dynamicValueArr);

        // 只保留唯一的 fixed 字段
        const fixedFields = Array.from(new Set(fixedKeys)).map((key) => ({
          key,
          required: true,
          fixed: true,
        }));

        setExtraInfoFields(fixedFields);
      }
    } else {
      form.resetFields();
    }
  }, [node]);

  useEffect(() => {
    const taskMeta = taskMetas.find((item) => item.value === nodeType) || null;
    const awardMeta = awardMetas.find((item) => item.value === rewardType) || null;
    setSelectedTaskMeta(taskMeta);
    setSelectedAwardMeta(awardMeta);

    const requireFields1 = getRequireFields(taskMeta);
    const requireFields2 = getRequireFields(awardMeta);
    const allRequireFields = Array.from(new Set([...(requireFields1 || []), ...(requireFields2 || [])]));
    setRequiredKeys(allRequireFields);

    // 只设置字段的元信息，value不管，form初始化那里赋值
    const extraKeys = allRequireFields.filter((key) => !formFieldKeys.includes(key));
    const fixedFields = extraKeys.map((key) => ({
      key,
      required: true,
      fixed: true,
    }));
    setExtraInfoFields(fixedFields);
  }, [nodeType, rewardType]);

  useEffect(() => {
    if (isDayType(timeType)) {
      const currentRange = form.getFieldValue('timeRange');
      if (Array.isArray(currentRange) && dayjs.isDayjs(currentRange[0])) {
        form.setFieldValue('timeRange', [0, 0]);
      }
    }
  }, [timeType]);
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const { timeRange, extraInfo, ...rest } = values;
      const dynamicEntries = (extraInfo?.dynamic || []).reduce((acc: Record<string, string>, { key, value }) => {
        if (key) acc[key] = value;
        return acc;
      }, {});

      const fixedEntries = extraInfo?.fixed || {};

      const extraInfoObj = {
        ...fixedEntries,
        ...dynamicEntries,
      };

      const updatedNode: Node<TaskData> = {
        ...node!,
        data: {
          ...node!.data,
          ...rest,
          startTime: timeRange?.[0]?.format('YYYY-MM-DD HH:mm:ss') || '',
          endTime: timeRange?.[1]?.format('YYYY-MM-DD HH:mm:ss') || '',
          extraInfo: extraInfoObj,
        },
      };
      onSave(updatedNode);
    } catch (err) {
      if (err.errorFields && err.errorFields.length > 0) {
        const firstError = err.errorFields[0];
        message.error(firstError.errors?.[0] || '表单验证失败');
      } else {
        message.error('表单验证失败，请检查输入', err);
      }
      console.warn('Validation failed:', err);
    }
  };
  const handleRewardTypeChange = (value: string) => {
    const meta = awardMetas.find((item) => item.value === value);
    setSelectedAwardMeta(meta || null);
  };

  const handleNodeTypeChange = (value: string) => {
    const meta = taskMetas.find((item) => item.value === value);
    setSelectedTaskMeta(meta || null);
  };

  const calcOffsetDates = () => {
    if (offsetTime == null) return '-';

    if (isDayType(timeType)) {
      if (startDay == null || endDay == null) return '-';

      // 计算开始和结束天数（秒数转成天，转成秒后加上offsetTime）
      // 先转成秒数再加offset秒数，最后格式化显示
      const startSeconds = startDay * 86400 + offsetTime;
      const endSeconds = endDay * 86400 + offsetTime;

      const startText = formatSecondsToDHMS(startSeconds);
      const endText = formatSecondsToDHMS(endSeconds);

      return `${startText} - ${endText}`;
    }

    if (Array.isArray(timeRange)) {
      const start = dayjs(timeRange[0]).add(offsetTime, 'second').format('YYYY-MM-DD HH:mm:ss');
      const end = dayjs(timeRange[1]).add(offsetTime, 'second').format('YYYY-MM-DD HH:mm:ss');
      return `${start} ~ ${end}`;
    }

    return '-';
  };

  const createFieldItem = (requiredKeys: string[]) => {
    return (name: string, label: string, component: React.ReactNode) => (
      <Form.Item
        name={name}
        label={label}
        rules={requiredKeys.includes(name) ? [{ required: true, message: `${label} 为必填项` }] : []}
      >
        {component}
      </Form.Item>
    );
  };
  const getFieldItem = useMemo(() => createFieldItem(requiredKeys), [requiredKeys]);

  const isDayType = (val: any): boolean => {
    const option = TimeStartTypeOptions.find((opt) => opt.value === val);
    return option?.type === TimeType.day;
  };

  return (
    <Modal
      open={visible}
      title="编辑任务"
      onOk={handleOk}
      onCancel={onCancel}
      width={900}
      bodyStyle={{ maxHeight: '80vh', overflowY: 'auto' }}
    >
      <Form form={form} layout="vertical">
        <Card title="任务基本信息" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>{getFieldItem('label', '标题', <Input />)}</Col>
            <Col span={12}>{getFieldItem('desc', '任务描述', <Input />)}</Col>
            <Col span={12}>
              {getFieldItem(
                'nodeType',
                '节点类型',
                <Select
                  options={nodeTypeOptions}
                  allowClear
                  onChange={(value) => {
                    handleNodeTypeChange(value);
                  }}
                />,
              )}
            </Col>
            <Col span={12}>{getFieldItem('sortId', '任务排序', <InputNumber min={0} style={{ width: '100%' }} />)}</Col>
          </Row>
        </Card>

        <Card title="任务条件" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>{getFieldItem('taskType', '任务类型', <Select allowClear />)}</Col>
            <Col span={12}>
              {getFieldItem('targetProcess', '达成值', <InputNumber min={0} style={{ width: '100%' }} />)}
            </Col>
            <Col span={12}>{getFieldItem('condition', '完成条件', <Input />)}</Col>
            <Col span={12}>{getFieldItem('weight', '任务权重', <InputNumber min={0} style={{ width: '100%' }} />)}</Col>
          </Row>
        </Card>

        <Card title="时间设置" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>{getFieldItem('timeType', '时间类型', <Select options={TimeStartTypeOptions} />)}</Col>

            <Col span={12}>
              {isDayType(timeType)
                ? getFieldItem(
                    'startEndDay',
                    '第几天~第几天',
                    <Input.Group compact style={{ display: 'flex' }}>
                      <Form.Item name="startDay" noStyle>
                        <InputNumber min={0} style={{ width: '50%' }} placeholder="开始天" />
                      </Form.Item>
                      <Form.Item name="endDay" noStyle>
                        <InputNumber min={0} style={{ width: '50%' }} placeholder="结束天" />
                      </Form.Item>
                    </Input.Group>,
                  )
                : getFieldItem('timeRange', '时间范围', <RangePicker showTime format="YYYY-MM-DD HH:mm:ss" />)}
            </Col>

            <Col span={12}>
              {getFieldItem('offsetTime', '偏移秒数', <InputNumber min={0} style={{ width: '100%' }} />)}
            </Col>

            <Col span={12}>
              <Form.Item label="偏移后时间">{offsetDisplay}</Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="任务奖励" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              {getFieldItem(
                'rewardType',
                '奖励类型',
                <Select
                  allowClear
                  options={awardMetas.map((meta) => ({ value: meta.value }))}
                  onChange={(value) => {
                    handleRewardTypeChange(value);
                  }}
                />,
              )}
            </Col>
            <Col span={12}>{getFieldItem('reward', '任务奖励', <Input />)}</Col>
          </Row>
        </Card>

        <Card title="额外信息" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            {/* 固定字段，横排布局，统一风格 */}
            {extraInfoFields.map(({ key, required }) => (
              <Col span={24} key={key}>
                <Space align="baseline">
                  {/* 字段名展示 */}
                  <Input placeholder="字段名" disabled={true} value={key} />
                  {/* 字段值输入 */}
                  <Form.Item
                    name={['extraInfo', 'fixed', key]}
                    rules={required ? [{ required: true, message: `${key} 为必填项` }] : []}
                  >
                    <Input placeholder="请输入字段值" />
                  </Form.Item>
                </Space>
              </Col>
            ))}

            {/* 动态字段列表 */}
            <Col span={24}>
              <Form.List name={['extraInfo', 'dynamic']}>
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                        <Form.Item
                          {...restField}
                          name={[name, 'key']}
                          rules={[{ required: true, message: '请输入字段名' }]}
                        >
                          <Input placeholder="字段名" />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'value']}
                          rules={[{ required: true, message: '请输入字段值' }]}
                        >
                          <Input placeholder="字段值" />
                        </Form.Item>
                        <MinusCircleOutlined onClick={() => remove(name)} />
                      </Space>
                    ))}
                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                        添加额外字段
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </Col>
          </Row>
        </Card>
      </Form>
    </Modal>
  );
};
