/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

// TaskTypeMeta.ts

export enum TaskType {
  PassTask = 'pass_task',
  EquipTask = 'equip_task',
  BagTask = 'bag_task',
  KillMasterTask = 'kill_master_task',
  DrawCardTask = 'draw_card_task',
  LoginTask = 'login_task',
  PassTaskDiffChapterTask = 'pass_task_diff_chapterId',
  ShopTask = 'shop_task',
  ItemLevelUpTask = 'item_level_up_task',
  ItemStarUpTask = 'item_star_up_task',
  GetCountTask = 'get_count_task',
  TalentTask = 'talent_task',
  TalentTotalTask = 'talent_total_task',
  TalentModelTypeTotalTask = 'talent_model_type_total_task',
  RoleUpTask = 'role_up_task',
  RoleAddLevelTask = 'role_add_level_task',
  // （role_sub_up_task 已废弃）
  ItemUseTimesTask = 'item_use_times_task',
  ItemUseTask = 'item_use_task',
  ChapterPickTask = 'chapter_pick_task',
  ChapterPickItemUniqueTask = 'chapter_pick_item_unique_task',
  ChapterUpWeaponTask = 'chapter_up_weapon_task',
  ChapterUpWeaponTimesTask = 'chapter_up_weapon_times_task',
  ChapterDestroyItemTask = 'chapter_destroy_item_task',
  OneChapterDestroyItemTask = 'one_chapter_destroy_item_task',
  PassWaveTask = 'pass_wave_task',
  BpUpLevelTask = 'bp_upLevel_task',
  ChapterUseTask = 'chapter_use_task',
  MushdashTask = 'mushdash_task',
  DealAwardAddProgressTask = 'dealAward_add_progress_task',
  TotalTalentUnlockedTask = 'total_talent_unlocked_task',
  InteractiveNpcTask = 'interactive_npc_task',
  ShootBasketballTask = 'shoot_basketball_task',
  ShootBasketballHitTask = 'shoot_basketball_hit_task',
  ActivateEquipSetTask = 'activate_equip_set_task',
  DeliveryTask = 'delivery_task',
  HadRoleTask = 'had_role_task',
  ChallengeBossTask = 'challenge_boss_task',
  AccessDiscPlayerTask = 'access_disc_player_task',
  ChapterDeadTask = 'chapter_dead_task',
  TotalPayAmountTask = 'total_pay_amount_task',
  PassedTask = 'passed_task',
  FinishBartenderTask = 'finish_bartender_task',
  ReceiveBarRewardTask = 'receive_bar_reward_task',
  ChapterAddTask = 'chapter_add_task',
  OneChapterAddTask = 'one_chapter_add_task',
  OneChapterPickTask = 'one_chapter_pick_task',
  ChapterOpenChestTask = 'chapter_open_chest_task',
  ChapterFireBulletTask = 'chapter_fire_bullet_task',
  DanceTask = 'dance_task',
  TagTask = 'tag_task',
  KillPlayerTask = 'kill_player_task',
  CustomCountTask = 'custom_count_task',
  FinishAllDayTask = 'finish_all_day_task',
  FinishSingleDayTask = 'finish_single_day_task',
  ReceivePetBillTask = 'receive_pet_bill_task',
  DrawPetTask = 'draw_pet_task',
  PetLevelUpTask = 'pet_level_up_task',
  BeginPetOperateTask = 'begin_pet_operate_task',
  ItemPromoteTask = 'item_promote_task',
  RolePromoteTask = 'role_promote_task',
  PetSkillUpTask = 'pet_skill_up_task',
  CellOpenTask = 'cell_open_task',
  TtmLevelUpTask = 'ttm_level_up_task',
  TtmWeaponForgeTask = 'ttm_weapon_forge_task',
  TtmWeaponLevelTask = 'ttm_weapon_level_task',
  TtmImmortalityValueTask = 'ttm_immortality_value_task',
  DarkZoneInnerOccupationUpLevel = 'dark_zone_inner_occupation_up_level_task',
  DarkZoneOuterOccupationUpLevel = 'dark_zone_outer_occupation_up_level_task',
  DarkZoneOuterOccupationTotal = 'dark_zone_outer_occupation_total_level_task',
  DarkZoneCorruptLevelTask = 'dark_zone_corrupt_level_task',
  DarkZoneCorruptEquipTask = 'dark_zone_corrupt_equip_task',
}

export interface TaskTypeMetaItem {
  label: string;
  fields: string[];
}

export const TaskTypeMeta: Record<TaskType, TaskTypeMetaItem> = {
  [TaskType.PassTask]: {
    label: '挑战类型任务',
    fields: [
      'pass_model_type',
      'pass_win_type',
      'pass_difficulty_type',
      'pass_chapter_type',
      'pass_chapter_pass_time',
      'pass_chapter_id',
      'pass_layer_num',
      'pass_multi_play',
      'pass_chapter_pass_total_time',
      'pass_room_type',
      'role_id',
      'ttm_weapon_ids',
      'ttm_weapon_types',
    ],
  },
  [TaskType.EquipTask]: {
    label: '装备类型任务',
    fields: ['equip_itemId', 'equip_level', 'equip_star', 'equip_quality'],
  },
  [TaskType.BagTask]: {
    label: '背包类型任务',
    fields: ['bag_itemId', 'bag_trade_type', 'bag_quality', 'bag_level', 'bag_star', 'bag_item_type', 'bag_item_part'],
  },
  [TaskType.KillMasterTask]: {
    label: '杀怪类型任务',
    fields: [
      'kill_master_type',
      'kill_master_id',
      'kill_model_type',
      'kill_layer_num',
      'kill_difficulty',
      'role_id',
      'ttm_weapon_ids',
      'ttm_weapon_types',
    ],
  },
  [TaskType.DrawCardTask]: {
    label: '抽卡任务',
    fields: ['draw_card_pool_id'],
  },
  [TaskType.LoginTask]: {
    label: '登陆任务',
    fields: [],
  },
  [TaskType.PassTaskDiffChapterTask]: {
    label: '通关多章节任务',
    fields: ['pass_task_diff_chapterId'],
  },
  [TaskType.ShopTask]: {
    label: '商城购买任务',
    fields: ['shop_id', 'shop_type', 'shop_pay_type', 'shop_pay_amount'],
  },
  [TaskType.ItemLevelUpTask]: {
    label: '提升纪念品等级次数',
    fields: ['equip_level_now'],
  },
  [TaskType.ItemStarUpTask]: {
    label: '提升纪念品刻度次数',
    fields: ['equip_itemId', 'equip_level'],
  },
  [TaskType.GetCountTask]: {
    label: '获取道具计数任务',
    fields: ['bag_itemId', 'bag_trade_type', 'bag_quality', 'bag_level', 'bag_star'],
  },
  [TaskType.TalentTask]: {
    label: '天赋树解锁次数任务',
    fields: ['talent_unlock_id', 'talent_unlock_type', 'talent_unlock_group', 'talent_model_type'],
  },
  [TaskType.TalentTotalTask]: {
    label: '天赋树解锁天赋数任务',
    fields: ['talent_unlock_id', 'talent_unlock_type', 'talent_unlock_group', 'talent_model_type'],
  },
  [TaskType.TalentModelTypeTotalTask]: {
    label: '天赋树总激活数任务',
    fields: ['talent_model_type'],
  },
  [TaskType.RoleUpTask]: {
    label: '角色达成指定等级任务',
    fields: ['role_id', 'role_new_level'],
  },
  [TaskType.RoleAddLevelTask]: {
    label: '角色升级增量任务',
    fields: ['role_id'],
  },
  [TaskType.ItemUseTimesTask]: {
    label: '消耗道具次数任务',
    fields: [
      'item_use_itemId',
      'item_use_trade_type',
      'item_use_quality',
      'item_use_level',
      'item_use_star',
      'item_use_item_type',
    ],
  },
  [TaskType.ItemUseTask]: {
    label: '消耗道具任务',
    fields: [
      'item_use_itemId',
      'item_use_trade_type',
      'item_use_quality',
      'item_use_level',
      'item_use_star',
      'item_use_item_type',
    ],
  },
  [TaskType.ChapterPickTask]: {
    label: '局内拾取任务',
    fields: [
      'pick_id',
      'pick_item_type',
      'pick_sub_item_type',
      'pass_room_type',
      'pick_game_type',
      'pick_chapter_id',
      'pick_difficulty',
      'ttm_weapon_type',
    ],
  },
  [TaskType.ChapterPickItemUniqueTask]: {
    label: '局内拾取（枪械）任务',
    fields: ['pick_id', 'pick_item_type', 'pick_sub_item_type'],
  },
  [TaskType.ChapterUpWeaponTask]: {
    label: '局内升级武器任务',
    fields: [
      'weapon_up_level',
      'weapon_type',
      'before_weapon_id',
      'after_weapon_id',
      'before_weapon_level',
      'after_weapon_level',
    ],
  },
  [TaskType.ChapterUpWeaponTimesTask]: {
    label: '局内升级武器次数任务',
    fields: [
      'weapon_up_level',
      'weapon_type',
      'before_weapon_id',
      'after_weapon_id',
      'before_weapon_level',
      'after_weapon_level',
    ],
  },
  [TaskType.ChapterDestroyItemTask]: {
    label: '局内摧毁任务',
    fields: ['destroy_id', 'destroy_type', 'destroy_chapter_id'],
  },
  [TaskType.OneChapterDestroyItemTask]: {
    label: '单局摧毁任务',
    fields: ['destroy_id', 'destroy_type', 'destroy_chapter_id'],
  },
  [TaskType.PassWaveTask]: {
    label: '通过波数任务',
    fields: ['kill_model_type'],
  },
  [TaskType.BpUpLevelTask]: {
    label: 'BP 升级任务',
    fields: [],
  },
  [TaskType.ChapterUseTask]: {
    label: '局内使用道具任务',
    fields: [
      'item_use_itemId',
      'item_use_trade_type',
      'item_use_quality',
      'item_use_level',
      'item_use_star',
      'item_use_item_type',
    ],
  },
  [TaskType.MushdashTask]: {
    label: '联动活动任务',
    fields: ['rank_score', 'rank_accuracy', 'rank_diff'],
  },
  [TaskType.DealAwardAddProgressTask]: {
    label: '领奖加进度任务',
    fields: ['weight'],
  },
  [TaskType.TotalTalentUnlockedTask]: {
    label: '累计解锁天赋任务',
    fields: [],
  },
  [TaskType.InteractiveNpcTask]: {
    label: '与 NPC 交互任务',
    fields: ['npc_id'],
  },
  [TaskType.ShootBasketballTask]: {
    label: '投篮任务',
    fields: [],
  },
  [TaskType.ShootBasketballHitTask]: {
    label: '投篮命中任务',
    fields: [],
  },
  [TaskType.ActivateEquipSetTask]: {
    label: '激活套装任务',
    fields: ['inside_type', 'equip_set_type'],
  },
  [TaskType.DeliveryTask]: {
    label: '每日快递任务',
    fields: [],
  },
  [TaskType.HadRoleTask]: {
    label: '拥有多少角色任务',
    fields: ['bag_item_type'],
  },
  [TaskType.ChallengeBossTask]: {
    label: '挑战指定 Boss 任务',
    fields: ['master_id', 'model_type', 'pass_chapter_id'],
  },
  [TaskType.AccessDiscPlayerTask]: {
    label: '前往点唱机返回大厅任务',
    fields: [],
  },
  [TaskType.ChapterDeadTask]: {
    label: '局内死亡任务',
    fields: ['model_type'],
  },
  [TaskType.TotalPayAmountTask]: {
    label: '历史累计消费金额任务',
    fields: [],
  },
  [TaskType.PassedTask]: {
    label: '通关过某关卡任务',
    fields: ['pass_chapter_id'],
  },
  [TaskType.FinishBartenderTask]: {
    label: '完成调酒任务',
    fields: [],
  },
  [TaskType.ReceiveBarRewardTask]: {
    label: '领取收银台收益任务',
    fields: [],
  },
  [TaskType.ChapterAddTask]: {
    label: '局内增加道具任务',
    fields: ['item_add_itemId'],
  },
  [TaskType.OneChapterAddTask]: {
    label: '单局增加道具任务',
    fields: ['item_add_itemId'],
  },
  [TaskType.OneChapterPickTask]: {
    label: '单局拾取道具任务',
    fields: ['pick_id', 'pick_item_type', 'pick_sub_item_type'],
  },
  [TaskType.ChapterOpenChestTask]: {
    label: '局内开宝箱任务',
    fields: [],
  },
  [TaskType.ChapterFireBulletTask]: {
    label: '局内开枪任务',
    fields: [],
  },
  [TaskType.DanceTask]: {
    label: '跳舞任务',
    fields: [],
  },
  [TaskType.TagTask]: {
    label: 'Tag 任务',
    fields: ['tag_key'],
  },
  [TaskType.KillPlayerTask]: {
    label: '击杀玩家任务',
    fields: [],
  },
  [TaskType.CustomCountTask]: {
    label: '自定义计数任务',
    fields: [],
  },
  [TaskType.FinishAllDayTask]: {
    label: '完成所有每日任务',
    fields: [],
  },
  [TaskType.FinishSingleDayTask]: {
    label: '完成单个每日任务',
    fields: [],
  },
  [TaskType.ReceivePetBillTask]: {
    label: '领取宠物经营账单收益',
    fields: [],
  },
  [TaskType.DrawPetTask]: {
    label: '抽宠物任务',
    fields: ['pet_id', 'egg_id'],
  },
  [TaskType.PetLevelUpTask]: {
    label: '宠物升级任务',
    fields: ['pet_level_now', 'pet_id'],
  },
  [TaskType.BeginPetOperateTask]: {
    label: '开始宠物经营任务',
    fields: [],
  },
  [TaskType.ItemPromoteTask]: {
    label: '纪念品提升任务',
    fields: [],
  },
  [TaskType.RolePromoteTask]: {
    label: '角色提升任务',
    fields: [],
  },
  [TaskType.PetSkillUpTask]: {
    label: '宠物技能升级任务',
    fields: ['pet_id'],
  },
  [TaskType.CellOpenTask]: {
    label: '格子打开任务',
    fields: [],
  },
  [TaskType.TtmLevelUpTask]: {
    label: '玩法铁匠升级任务',
    fields: ['ttm_level_now'],
  },
  [TaskType.TtmWeaponForgeTask]: {
    label: '玩法武器锻造任务',
    fields: ['ttm_weapon_id', 'ttm_weapon_type', 'ttm_weapon_quality'],
  },
  [TaskType.TtmWeaponLevelTask]: {
    label: '玩法武器升级任务',
    fields: ['ttm_weapon_id', 'ttm_weapon_type', 'ttm_weapon_level_now', 'ttm_weapon_quality'],
  },
  [TaskType.TtmImmortalityValueTask]: {
    label: '环月修仙值累计任务',
    fields: ['ttm_immortality_value'],
  },
  [TaskType.DarkZoneInnerOccupationUpLevel]: {
    label: '黑海局内职业升级任务',
    fields: ['dark_zone_inner_occupation_id'],
  },
  [TaskType.DarkZoneOuterOccupationUpLevel]: {
    label: '黑海局外职业升级任务',
    fields: ['dark_zone_outer_occupation_id'],
  },
  [TaskType.DarkZoneOuterOccupationTotal]: {
    label: '黑海局外职业总升级数任务',
    fields: ['dark_zone_outer_occupation_total_level'],
  },
  [TaskType.DarkZoneCorruptLevelTask]: {
    label: '黑海局内腐败等级任务',
    fields: ['dark_zone_corrupt_level'],
  },
  [TaskType.DarkZoneCorruptEquipTask]: {
    label: '黑海局内腐败装备数任务',
    fields: ['dark_zone_corrupt_equip'],
  },
};
