# 圈子功能特性说明

## 功能概述

圈子功能是沸点社区的核心社交能力，允许用户围绕共同兴趣、技术领域或话题进行交流。用户可以:

- 浏览热门、最新圈子
- 查看圈子详情（包括成员、帖子）
- 关注/取消关注圈子
- 筛选属于特定圈子的内容
- 搜索圈子

## 已实现组件

1. **TypeScript类型定义 (src/types/circle.ts)**
   - 定义了圈子列表、详情、关注等类型接口
   - 与后端API格式保持一致

2. **API服务层 (src/services/circleService.ts)**
   - 实现了获取圈子列表、获取详情、关注/取消关注功能
   - 提供了封装的便捷方法，如获取热门、最新圈子

3. **圈子列表组件 (src/components/moments/CircleList.vue)**
   - 展示圈子列表，支持分页加载
   - 实现关注/取消关注功能
   - 显示圈子信息、成员数、帖子数等

4. **圈子详情组件 (src/components/moments/CircleDetail.vue)**
   - 展示圈子详细信息，包括创建者、官方状态等
   - 提供Tab切换显示帖子、成员和圈子介绍
   - 支持关注/取消关注操作

5. **侧边栏集成 (src/components/moments/MomentSidebarLeft.vue)**
   - 集成热门圈子列表展示
   - 支持圈子选择，切换不同分类和圈子

## 数据结构

圈子的核心数据字段包括：

- `circleId`: 圈子唯一标识符
- `name`: 圈子名称
- `description`: 圈子描述
- `icon`: 圈子图标URL
- `postCount`: 发帖数量
- `memberCount`: 成员数量
- `isOfficial`: 是否官方圈子标识
- `isFollowed`: 当前用户是否已关注

## API接口

后端API接口遵循RESTful风格：

- `GET /api/circle/v1/list`: 获取圈子列表，支持分页、搜索和排序
- `GET /api/circle/v1/detail`: 获取圈子详情信息
- `POST /api/circle/v1/join`: 关注/取消关注圈子

## 使用示例

### 展示圈子列表

```vue
<template>
  <CircleList :orderBy="'hot'" :perPage="10" />
</template>
```

### 展示圈子详情

```vue
<template>
  <CircleDetail :circleId="123" />
</template>
```

### 关注圈子

```js
import { joinCircle } from '../services/circleService';

// 关注/取消关注圈子
const handleFollow = async (circleId) => {
  try {
    const response = await joinCircle({ circleId });
    if (response.code === 0) {
      // 操作成功，根据response.data.isFollowed判断新状态
    }
  } catch (err) {
    console.error('操作失败', err);
  }
};
```

## 扩展计划

1. 实现圈子创建功能
2. 实现圈子管理后台
3. 添加圈子排序和筛选功能
4. 实现圈子成员列表和管理 