# 图标迁移说明

## 图标字体迁移到Iconify

本项目原来使用阿里图标库（iconfont）作为图标解决方案，但由于远程字体文件链接失效：

```
GET https://at.alicdn.com/t/font_2159558_p9y01y35.woff2 net::ERR_ABORTED 404 (Not Found)
```

我们将图标解决方案迁移到了 Iconify，这是一个更现代化的图标解决方案：

1. 不需要下载和维护字体文件
2. 图标按需加载，不会增加初始加载体积
3. 提供了丰富的图标集合，如Material Design Icons、Font Awesome等

## 如何使用

在Vue组件中使用Iconify图标：

```vue
<template>
  <Icon icon="mdi:home" />
</template>

<script setup>
import { Icon } from '@iconify/vue';
</script>
```

## 常用图标对照表

| 原iconfont类名 | 新Iconify图标 | 描述 |
|--------------|-------------|------|
| icon-folder | mdi:folder-outline | 文件夹图标 |
| icon-download | mdi:download-outline | 下载图标 |
| icon-user | mdi:account-outline | 用户图标 |
| icon-time | mdi:clock-outline | 时间图标 |
| icon-view | mdi:eye-outline | 查看图标 |
| icon-search | mdi:magnify | 搜索图标 |
| icon-upload | mdi:upload | 上传图标 |
| icon-share | mdi:share | 分享图标 |
| icon-wechat | mdi:wechat | 微信图标 |
| icon-qq | mdi:qqchat | QQ图标 |
| icon-weibo | mdi:sina-weibo | 微博图标 |
| icon-video | ri:bilibili-fill | B站图标 |

## 图标集参考

- [Material Design Icons](https://icon-sets.iconify.design/mdi/)
- [Remix Icons](https://icon-sets.iconify.design/ri/)
- [Font Awesome](https://icon-sets.iconify.design/fa6-solid/) 