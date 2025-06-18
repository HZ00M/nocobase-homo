/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Input, Tooltip, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

interface TemplateItem {
  id: string;
  title: string;
  description?: string;
}

interface TemplateSelectorProps {
  templates: TemplateItem[];
  onSelect?: (id: string) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ templates, onSelect }) => {
  const [searchText, setSearchText] = useState('');

  const getMatchScore = (tpl: TemplateItem, keyword: string) => {
    const lower = keyword.toLowerCase();
    const exact = (v?: string) => v?.toLowerCase() === lower;
    const partial = (v?: string) => v?.toLowerCase().includes(lower);

    if (exact(tpl.title)) return 0;
    if (exact(tpl.description)) return 1;
    if (partial(tpl.title)) return 10;
    if (partial(tpl.description)) return 11;
    return Infinity;
  };

  const filtered = useMemo(() => {
    if (!searchText) return templates;
    return [...templates]
      .map((tpl) => ({ tpl, score: getMatchScore(tpl, searchText) }))
      .filter((entry) => entry.score !== Infinity)
      .sort((a, b) => a.score - b.score)
      .map((entry) => entry.tpl);
  }, [templates, searchText]);

  return (
    <div style={{ marginTop: 8 }}>
      <Input
        allowClear
        placeholder="搜索模板标题或描述"
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 8 }}
      />
      {filtered.length === 0 ? (
        <Empty description="无匹配模板" />
      ) : (
        filtered.map((tpl) => (
          <Tooltip key={tpl.id} title={tpl.description || '无描述'} placement="right">
            <div
              style={{
                ...buttonStyle,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: '100%',
                textAlign: 'left',
              }}
              onClick={() => onSelect?.(tpl.id)}
            >
              {tpl.title}
            </div>
          </Tooltip>
        ))
      )}
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  padding: '6px 10px',
  border: '1px solid #d9d9d9',
  borderRadius: 4,
  marginBottom: 6,
  backgroundColor: '#fff',
  cursor: 'pointer',
  fontSize: 14,
  transition: 'all 0.2s',
};
