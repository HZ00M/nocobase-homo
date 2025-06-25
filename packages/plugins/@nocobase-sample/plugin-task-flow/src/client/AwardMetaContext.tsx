/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { createContext, useContext, useRef, useState } from 'react';
import type { TaskMeta } from './types';

export const AwardMetaContext = createContext<{
  awardMetas: TaskMeta[];
  awardMetasRef: React.MutableRefObject<TaskMeta[]>;
  setAwardMetas: (v: TaskMeta[]) => void;
}>(null!);

export const AwardMetaProvider: React.FC = ({ children }) => {
  const [awardMetas, _setAwardMetas] = useState<TaskMeta[]>([]);
  const awardMetasRef = useRef<TaskMeta[]>([]);

  const setAwardMetas = (v: TaskMeta[]) => {
    awardMetasRef.current = v; // 保证 ref 始终更新
    _setAwardMetas(v);
  };

  return (
    <AwardMetaContext.Provider
      value={{ awardMetas: awardMetas, awardMetasRef: awardMetasRef, setAwardMetas: setAwardMetas }}
    >
      {children}
    </AwardMetaContext.Provider>
  );
};

export const useAwardMetas = () => useContext(AwardMetaContext);
