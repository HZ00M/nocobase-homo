/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, DatePicker, Form, Input, InputNumber, message, Modal, Row, Select, Space } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import type { Node } from 'reactflow';
import type { TaskData, TaskMeta } from './types';
import dayjs from 'dayjs';
import { TimeStartTypeOptions, TimeType } from './constants';
import { useTaskMetas } from './TaskMetaContext';
import { useAwardMetas } from './AwardMetaContext';
import { formatSecondsToDHMS } from './utils';
import { TaskType, TaskTypeMeta } from './TaskTypeEnums';
import { useReadableConditions } from './useReadableConditions';

const { RangePicker } = DatePicker;

interface EditTaskModalProps {
  visible: boolean;
  node: Node<TaskData> | null;
  onSave: (node: Node<TaskData>) => void;
  onCancel: () => void;
}

const isDayType = (timeType: number): boolean => {
  const option = TimeStartTypeOptions.find((opt) => opt.value === timeType);
  return option?.type === TimeType.day;
};
export const calcOffsetDates = (timeType: number, originTime: number, offsetTime = 0) => {
  if (originTime == null || isNaN(originTime)) return '/';

  let showValue = '';
  if (isDayType(timeType)) {
    const totalSeconds = originTime * 86400 + offsetTime;
    showValue = formatSecondsToDHMS(totalSeconds);
  } else {
    const offsetDate = dayjs.unix(originTime).add(offsetTime, 'second');
    showValue = offsetDate.isValid() ? offsetDate.format('YYYY-MM-DD HH:mm:ss') : '/';
  }

  return showValue;
};
export const EditTaskModal: React.FC<EditTaskModalProps> = ({ visible, node, onSave, onCancel }) => {
  const { getReadableCondition } = useReadableConditions();
  const [readableText, setReadableText] = useState<string>('');
  const { taskMetas } = useTaskMetas();
  const { awardMetas } = useAwardMetas();
  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setExtraInfoFields([]);
      setRequiredKeys([]);
      setReadableText('');
      setOffsetDisplay('-');
      form.setFieldValue(['extraInfo', 'dynamic'], []);
      form.setFieldValue(['extraInfo', 'fixed'], {});
    }
  }, [visible]);
  const nodeTypeOptions = taskMetas.map((item) => ({
    label: item.value,
    value: item.value,
    title: item.desc,
  }));

  const [form] = Form.useForm();

  const [extraInfoFields, setExtraInfoFields] = useState<any[]>([]);

  const timeType = Form.useWatch('timeType', form);
  const offsetTime = Form.useWatch('offsetTime', form);
  const timeRange = Form.useWatch('timeRange', form);
  const startTime = Form.useWatch('startTime', form);
  const endTime = Form.useWatch('endTime', form);
  const [offsetDisplay, setOffsetDisplay] = useState('-');
  const nodeType = Form.useWatch('nodeType', form);
  const rewardType = Form.useWatch('rewardType', form);

  const formFieldKeys: string[] = [
    'parentId',
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

  const taskTypeOptions = useMemo(
    () =>
      Object.values(TaskType).map((type) => {
        const meta = TaskTypeMeta[type];
        const fieldStr = Array.isArray(meta.fields) ? meta.fields.join(', ') : '';
        return {
          value: type,
          label: `${type} (${meta.label})`,
          title: `${meta.label}${fieldStr ? `，配置项：${fieldStr}` : ''}`,
        };
      }),
    [],
  );

  useEffect(() => {
    if (node) {
      const { data } = node;
      if (isDayType(data.timeType)) {
        // 天数偏移直接数字赋值
        form.setFieldsValue({
          ...data,
          startTime: data.startTime,
          endTime: data.endTime,
          timeRange: undefined,
        });
      } else {
        // 非天数类型，确认时间戳单位，转换为dayjs对象数组（秒单位转dayjs）
        const start = data.startTime ? dayjs.unix(data.startTime) : undefined;
        const end = data.endTime ? dayjs.unix(data.endTime) : undefined;
        form.setFieldsValue({
          ...data,
          timeRange: start && end ? [start, end] : undefined,
          startTime: undefined,
          endTime: undefined,
        });
      }
      if (data.extraInfo) {
        const allKeys = Object.keys(data.extraInfo || {});
        const taskMeta = taskMetas.find((item) => item.value === data.nodeType) || null;
        const awardMeta = awardMetas.find((item) => item.value === data.rewardType) || null;

        const requireFields1 = getRequireFields(taskMeta);
        const requireFields2 = getRequireFields(awardMeta);
        const allRequireFields = Array.from(new Set([...(requireFields1 || []), ...(requireFields2 || [])]));
        setRequiredKeys(allRequireFields);
        const fixedKeys = allRequireFields.filter((key) => allKeys.includes(key));

        const dynamicKeys = allKeys.filter((key) => !formFieldKeys.includes(key) && !fixedKeys.includes(key));

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

    const requireFields1 = getRequireFields(taskMeta);
    const requireFields2 = getRequireFields(awardMeta);
    const allRequireFields = Array.from(new Set([...(requireFields1 || []), ...(requireFields2 || [])]));
    setRequiredKeys(allRequireFields);

    const extraKeys = allRequireFields.filter((key) => !formFieldKeys.includes(key));
    const fixedFields = extraKeys.map((key) => ({
      key,
      required: true,
      fixed: true,
    }));
    setExtraInfoFields(fixedFields);
  }, [nodeType, rewardType]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const show = isDayType(timeType)
        ? `${calcOffsetDates(timeType, startTime, offsetTime)} ~ ${calcOffsetDates(timeType, endTime, offsetTime)}`
        : timeRange && timeRange.length === 2
          ? `${calcOffsetDates(timeType, dayjs(timeRange[0]).unix(), offsetTime)} ~ ${calcOffsetDates(
              timeType,
              dayjs(timeRange[1]).unix(),
              offsetTime,
            )}`
          : '-';
      setOffsetDisplay(show);
    }, 100);
    return () => clearTimeout(timeout);
  }, [timeType, startTime, endTime, timeRange, offsetTime]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const { extraInfo, ...rest } = values;
      // 合并额外信息
      const dynamicEntries = (extraInfo?.dynamic || []).reduce((acc: Record<string, string>, { key, value }) => {
        if (key) acc[key] = value;
        return acc;
      }, {});
      let finalStartTime: number | undefined;
      let finalEndTime: number | undefined;

      if (isDayType(timeType)) {
        // 天数类型：直接使用 startTime/endTime 数值
        finalStartTime = Number(startTime ?? 0);
        finalEndTime = Number(endTime ?? 0);
      } else {
        // 时间戳类型：将 timeRange 转为秒级时间戳
        if (Array.isArray(timeRange) && timeRange.length === 2) {
          finalStartTime = dayjs(timeRange[0]).unix();
          finalEndTime = dayjs(timeRange[1]).unix();
        }
      }
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
          timeType,
          startTime: finalStartTime,
          endTime: finalEndTime,
          extraInfo: extraInfoObj,
        },
      };
      onSave(updatedNode);
    } catch (err: any) {
      if (err.errorFields && err.errorFields.length > 0) {
        const firstError = err.errorFields[0];
        message.error(firstError.errors?.[0] || '表单验证失败');
      } else {
        message.error('表单验证失败，请检查输入');
      }
      console.warn('Validation failed:', err);
    }
  };
  const getTimeFieldItem = (timeType: number | undefined, requiredKeys: string[]) => {
    const isRequiredStart = requiredKeys.includes('startTime');
    const isRequiredEnd = requiredKeys.includes('endTime');
    return (
      <Form.Item label="时间设置" required>
        {isDayType(timeType) ? (
          <Input.Group compact style={{ display: 'flex' }}>
            <Form.Item
              name="startTime"
              noStyle
              rules={isRequiredStart ? [{ required: false, message: '开始天数必填' }] : []}
            >
              <InputNumber min={0} style={{ width: '50%' }} placeholder="开始天（偏移）" />
            </Form.Item>
            <Form.Item
              name="endTime"
              noStyle
              rules={isRequiredEnd ? [{ required: false, message: '结束天数必填' }] : []}
            >
              <InputNumber min={0} style={{ width: '50%' }} placeholder="结束天（偏移）" />
            </Form.Item>
          </Input.Group>
        ) : (
          <Form.Item name="timeRange" noStyle rules={[{ required: true, message: '请选择时间范围' }]}>
            <RangePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} />
          </Form.Item>
        )}
      </Form.Item>
    );
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

  return (
    <Modal
      style={{ top: 40 }}
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
              {getFieldItem('nodeType', '节点类型', <Select showSearch options={nodeTypeOptions} allowClear />)}
            </Col>
            <Col span={12}>{getFieldItem('sortId', '任务排序', <InputNumber min={0} style={{ width: '100%' }} />)}</Col>
          </Row>
        </Card>

        <Card title="任务条件" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              {getFieldItem(
                'taskType',
                '任务类型',
                <Select showSearch allowClear options={taskTypeOptions} placeholder="请选择任务类型" />,
              )}
            </Col>
            <Col span={12}>
              {getFieldItem('targetProcess', '达成值', <InputNumber min={0} style={{ width: '100%' }} />)}
            </Col>
            <Col span={12}>
              <Form.Item
                label="完成条件"
                required={requiredKeys.includes('condition')}
                style={{ marginBottom: 0 }}
                help={
                  readableText ? (
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#ff4d4f' }}>{readableText}</pre>
                  ) : null
                }
                validateStatus={readableText ? 'error' : undefined}
              >
                <Input.Group compact style={{ display: 'flex' }}>
                  <Form.Item name="condition" noStyle>
                    <Input placeholder="请输入条件ID" />
                  </Form.Item>
                  <Button
                    type="default"
                    onClick={async () => {
                      const id = form.getFieldValue('condition');
                      if (!id) {
                        setReadableText('请先填写条件ID');
                        return;
                      }

                      try {
                        const text = await getReadableCondition(id);
                        setReadableText(text || '未找到该条件');
                      } catch (err) {
                        console.error('条件查询失败', err);
                        setReadableText('条件解析失败');
                      }
                    }}
                  >
                    检查
                  </Button>
                </Input.Group>
              </Form.Item>
            </Col>

            <Col span={12}>{getFieldItem('weight', '任务权重', <InputNumber min={0} style={{ width: '100%' }} />)}</Col>
          </Row>
        </Card>

        <Card title="时间设置" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              {getFieldItem('timeType', '时间类型', <Select showSearch options={TimeStartTypeOptions} />)}
            </Col>

            <Col span={12}>
              <Form.Item shouldUpdate>
                {({ getFieldValue }) => {
                  const currentTimeType = getFieldValue('timeType');
                  return getTimeFieldItem(currentTimeType, requiredKeys);
                }}
              </Form.Item>
            </Col>

            <Col span={12}>
              {getFieldItem(
                'offsetTime',
                '偏移秒数',
                <InputNumber defaultValue={0} min={0} style={{ width: '100%' }} />,
              )}
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
                  showSearch
                  placeholder="请选择奖励类型"
                  options={awardMetas.map((meta) => ({
                    value: meta.value,
                    label: meta.value, // 显示文本
                    title: meta.desc, // 鼠标悬停提示
                  }))}
                />,
              )}
            </Col>
            <Col span={12}>{getFieldItem('reward', '任务奖励', <Input />)}</Col>
          </Row>
        </Card>

        <Card title="额外信息" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            {extraInfoFields.map(({ key, required }) => (
              <Col span={24} key={key}>
                <Space align="baseline">
                  <Input placeholder="字段名" disabled value={key} />
                  <Form.Item
                    name={['extraInfo', 'fixed', key]}
                    rules={required ? [{ required: true, message: `${key} 为必填项` }] : []}
                  >
                    <Input placeholder="请输入字段值" />
                  </Form.Item>
                </Space>
              </Col>
            ))}

            <Col span={24}>
              <Form.List name={['extraInfo', 'dynamic']}>
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                        <Form.Item
                          {...restField}
                          name={[name, 'key']}
                          rules={[{ required: false, message: '请输入字段名' }]}
                        >
                          <Input placeholder="字段名" />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'value']}
                          rules={[{ required: false, message: '请输入字段值' }]}
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
