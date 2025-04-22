// 首页组件类型定义

// 公告类型
export interface Announcement {
  date: string;
  title: string;
  content: string;
  link: string;
}

// 交互项类型
export interface InteractionItem {
  icon: string;
  title: string;
  description: string;
  link: string;
  buttonText: string;
}

// 功能模块类型
export interface Module {
  icon: string;
  title: string;
  description: string;
  link: string;
  type?: string;
  hidden?: boolean;
  isPending?: boolean;
  isApproved?: boolean;
  isRejected?: boolean;
}