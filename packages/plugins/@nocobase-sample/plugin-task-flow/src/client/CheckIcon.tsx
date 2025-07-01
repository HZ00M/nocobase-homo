/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useState } from 'react';
import { Popover, Tag, Tooltip } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined, WarningOutlined } from '@ant-design/icons';

export enum CheckLevel {
  SUCCESS = 0,
  WARN = 1,
  ERROR = 2,
}

export interface CheckItem {
  level: CheckLevel;
  title: string;
  message: string;
  relatedIds?: string[];
}

export interface NodeCheckResult {
  list: CheckItem[];
}

const checkLevelMeta = {
  [CheckLevel.SUCCESS]: {
    style: { color: '#52c41a' },
    title: '检查通过',
    label: '通过',
    icon: <CheckCircleOutlined />,
  },
  [CheckLevel.WARN]: {
    style: { color: '#faad14' },
    title: '警告列表',
    label: '警告',
    icon: <ExclamationCircleOutlined />,
  },
  [CheckLevel.ERROR]: {
    style: { color: '#f5222d' },
    title: '错误列表',
    label: '错误',
    icon: <WarningOutlined />,
  },
} as const;

const getCheckLevel = (node) => {
  const list = node?.data?.checkResult?.list || [];
  if (list.some((i) => i.level === CheckLevel.ERROR)) return CheckLevel.ERROR;
  if (list.some((i) => i.level === CheckLevel.WARN)) return CheckLevel.WARN;
  return CheckLevel.SUCCESS;
};
export const getNodeColor = (node) => {
  const level = getCheckLevel(node);
  switch (level) {
    case CheckLevel.ERROR:
      return '#f5222d'; // 红
    case CheckLevel.WARN:
      return '#faad14'; // 黄
    case CheckLevel.SUCCESS:
    default:
      return '#52c41a'; // 绿
  }
};

function getStatusFromCheckList(list: CheckItem[]): CheckLevel {
  if (list.some((item) => item.level === CheckLevel.ERROR)) return CheckLevel.ERROR;
  if (list.some((item) => item.level === CheckLevel.WARN)) return CheckLevel.WARN;
  return CheckLevel.SUCCESS;
}

interface CheckIconProps {
  result?: NodeCheckResult;
  onClick?: (id: string) => void; // 点击
}

export const CheckIcon: React.FC<CheckIconProps> = ({ result, onClick }) => {
  const [popoverVisible, setPopoverVisible] = useState(false);
  if (!result) return null;
  const { list } = result;
  const level = getStatusFromCheckList(list);
  const meta = checkLevelMeta[level];
  return (
    <div style={{ position: 'absolute', top: 4, right: 4 }}>
      <Popover
        title={meta.title}
        overlayStyle={{ maxWidth: 260 }}
        open={popoverVisible}
        onOpenChange={setPopoverVisible}
        content={
          <div style={{ maxWidth: 240 }}>
            {list.map((item, i) => {
              const itemMeta = checkLevelMeta[item.level];
              return (
                <div
                  key={i}
                  style={{
                    border: `1px solid ${itemMeta.style.color}`,
                    borderRadius: 6,
                    padding: '6px 10px',
                    marginBottom: 6,
                    background: '#fff',
                  }}
                  title={item.message}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                    <Tag
                      style={{
                        backgroundColor: itemMeta.style.color,
                        color: '#fff',
                        marginRight: 8,
                        padding: '0 6px',
                      }}
                    >
                      {itemMeta.label}
                    </Tag>
                    <span style={{ fontSize: 13, color: '#333' }}>{item.title}</span>
                  </div>
                  {item.relatedIds?.length && (
                    <div style={{ marginTop: 6 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {item.relatedIds.map((rid, idx) => (
                          <Tooltip title={rid} key={rid}>
                            <div
                              onClick={() => {
                                onClick?.(rid);
                                // 点击后关闭 Popover
                                setPopoverVisible(false);
                              }}
                              style={{
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                backgroundColor: '#1890ff',
                                color: '#fff',
                                fontSize: 12,
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                userSelect: 'none',
                              }}
                            >
                              {idx + 1}
                            </div>
                          </Tooltip>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        }
      >
        <span
          style={{
            ...meta.style,
            fontSize: 18,
            cursor: 'pointer',
          }}
          onClick={() => setPopoverVisible(true)}
        >
          {meta.icon}
        </span>
      </Popover>
    </div>
  );
};
