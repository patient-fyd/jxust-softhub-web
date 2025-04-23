<template>
  <div class="team-container">
    <!-- 页面头部
    <div class="team-header">
      <img src="@/views/team/team-illustration.svg" alt="协会团队" class="team-header-image" />
    </div> -->

    <!-- 团队介绍 -->
    <div class="team-intro">
      <h2>我们的团队</h2>
      <p>软件协会拥有一支充满活力与创新精神的团队，由主席团、技术部、宣传部、组织部等部门组成。每位成员都以极大的热情投入到协会的建设与发展中，共同打造专业、活跃、实用的技术交流平台。</p>
    </div>

    <!-- 主席团 -->
    <section class="team-section leadership-section">
      <h3>主席团</h3>
      <div class="team-members">
        <div class="member-card leadership">
          <div class="member-avatar">
            <div class="avatar-placeholder">
              <span>张</span>
            </div>
          </div>
          <div class="member-info">
            <h4>张明</h4>
            <p class="member-title">会长</p>
            <p class="member-desc">计算机科学与技术专业，擅长全栈开发，负责协会整体规划与管理</p>
          </div>
        </div>
        <div class="member-card leadership">
          <div class="member-avatar">
            <div class="avatar-placeholder">
              <span>李</span>
            </div>
          </div>
          <div class="member-info">
            <h4>李华</h4>
            <p class="member-title">副会长</p>
            <p class="member-desc">软件工程专业，专注于人工智能与机器学习，负责协会技术方向</p>
          </div>
        </div>
        <div class="member-card leadership">
          <div class="member-avatar">
            <div class="avatar-placeholder">
              <span>王</span>
            </div>
          </div>
          <div class="member-info">
            <h4>王芳</h4>
            <p class="member-title">副会长</p>
            <p class="member-desc">数字媒体技术专业，擅长UI/UX设计，负责协会运营与宣传</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 部门导航 -->
    <div class="department-nav">
      <button 
        v-for="dept in departments" 
        :key="dept.id" 
        :class="['dept-btn', selectedDept === dept.id ? 'active' : '']"
        @click="selectedDept = dept.id"
      >
        {{ dept.name }}
      </button>
    </div>

    <!-- 部门成员展示 -->
    <section class="team-section department-section">
      <h3>{{ getDepartmentName() }}</h3>
      <div class="team-members">
        <div v-for="member in getDepartmentMembers()" :key="member.id" class="member-card">
          <div class="member-avatar">
            <div class="avatar-placeholder">
              <span>{{ member.name.charAt(0) }}</span>
            </div>
          </div>
          <div class="member-info">
            <h4>{{ member.name }}</h4>
            <p class="member-title">{{ member.title }}</p>
            <p class="member-desc">{{ member.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 历届贡献者 -->
    <section class="team-section alumni-section">
      <h3>历届贡献者</h3>
      <div class="alumni-container">
        <div v-for="(year, index) in alumni" :key="year.year" class="alumni-year">
          <div class="year-marker">{{ year.year }}</div>
          <div class="alumni-list">
            <div v-for="person in year.people" :key="person.name" class="alumni-item">
              <span class="alumni-name">{{ person.name }}</span>
              <span class="alumni-role">{{ person.role }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 加入团队 -->
    <section class="join-team-section">
      <h3>加入我们</h3>
      <p>我们一直在寻找热爱技术、充满热情的新成员。如果你对软件开发感兴趣，希望在大学期间提升自己的技术能力，欢迎加入我们的团队！</p>
      <router-link to="/join" class="join-btn">申请加入</router-link>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'Team',
  setup() {
    const selectedDept = ref('tech');

    const departments = [
      { id: 'tech', name: '技术部' },
      { id: 'pr', name: '宣传部' },
      { id: 'op', name: '组织部' },
      { id: 'res', name: '研发部' }
    ];

    const departmentMembers = {
      tech: [
        { id: 1, name: '陈强', title: '技术部长', description: '计算机科学专业，全栈工程师，负责协会技术项目开发与指导' },
        { id: 2, name: '赵佳', title: '前端组长', description: '软件工程专业，擅长Vue、React等前端框架，负责前端培训' },
        { id: 3, name: '刘伟', title: '后端组长', description: '网络工程专业，专注于Java与Spring开发，负责后端系统架构' },
        { id: 4, name: '杨明', title: '安全组长', description: '信息安全专业，网络安全爱好者，负责项目安全审核' },
        { id: 5, name: '周佳', title: '成员', description: '大数据专业，擅长数据分析与可视化' }
      ],
      pr: [
        { id: 1, name: '林小美', title: '宣传部长', description: '新媒体设计专业，负责协会品牌建设与宣传策划' },
        { id: 2, name: '郭明', title: '设计组长', description: 'UI设计专业，负责协会视觉设计与品牌形象' },
        { id: 3, name: '黄小红', title: '文案组长', description: '中文系，创意写作能力强，负责协会文案策划' },
        { id: 4, name: '张雨', title: '摄影组长', description: '摄影爱好者，负责协会活动纪实与形象照片' }
      ],
      op: [
        { id: 1, name: '孙明', title: '组织部长', description: '负责协会日常运营与会员管理' },
        { id: 2, name: '马丽', title: '活动组长', description: '组织能力强，负责策划协会各类活动' },
        { id: 3, name: '徐佳', title: '外联组长', description: '善于沟通，负责协会对外合作与资源对接' },
        { id: 4, name: '吴梦', title: '新媒体运营', description: '负责协会公众号、社交媒体的日常运营' }
      ],
      res: [
        { id: 1, name: '朱天明', title: '研发部长', description: '计算机科学与技术专业，负责协会创新项目研发' },
        { id: 2, name: '冯小伟', title: 'AI组长', description: '人工智能专业，专注于深度学习与计算机视觉' },
        { id: 3, name: '董亮', title: '游戏组长', description: '数字媒体专业，游戏开发爱好者，负责游戏项目' },
        { id: 4, name: '谢雨', title: '移动开发组长', description: '软件工程专业，专注于Flutter与React Native开发' }
      ]
    };

    const alumni = [
      { 
        year: '2022-2023',
        people: [
          { name: '张伟', role: '会长' },
          { name: '李明', role: '副会长' },
          { name: '王芳', role: '技术部长' },
          { name: '赵强', role: '宣传部长' }
        ]
      },
      {
        year: '2020-2021',
        people: [
          { name: '刘志', role: '会长' },
          { name: '陈红', role: '副会长' },
          { name: '黄明', role: '技术部长' },
          { name: '杨华', role: '宣传部长' }
        ]
      },
      {
        year: '2018-2019',
        people: [
          { name: '吴刚', role: '会长' },
          { name: '郑博', role: '副会长' },
          { name: '孙雷', role: '技术部长' },
          { name: '马丽', role: '宣传部长' }
        ]
      }
    ];

    const getDepartmentName = () => {
      const dept = departments.find(d => d.id === selectedDept.value);
      return dept ? dept.name : '';
    };

    const getDepartmentMembers = () => {
      return departmentMembers[selectedDept.value as keyof typeof departmentMembers] || [];
    };

    return {
      selectedDept,
      departments,
      alumni,
      getDepartmentName,
      getDepartmentMembers
    };
  }
});
</script>

<style scoped>
.team-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 60px;
}

.team-header {
  width: 100%;
  margin-bottom: 40px;
  overflow: hidden;
  border-radius: 8px;
}

.team-header-image {
  width: 100%;
  display: block;
  object-fit: cover;
}

.team-intro {
  text-align: center;
  margin-bottom: 50px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.team-intro h2 {
  color: #1e40af;
  font-size: 2rem;
  margin-bottom: 20px;
}

.team-intro p {
  color: #4b5563;
  font-size: 1.1rem;
  line-height: 1.7;
}

.team-section {
  margin-bottom: 60px;
}

.team-section h3 {
  color: #1e40af;
  font-size: 1.5rem;
  margin-bottom: 30px;
  position: relative;
  padding-bottom: 10px;
}

.team-section h3::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 50px;
  height: 3px;
  background-color: #1e40af;
}

.team-members {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
}

.member-card {
  background-color: #f9fafb;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
}

.member-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.member-card.leadership {
  grid-column: span 1;
  border-top: 3px solid #1e40af;
}

.member-avatar {
  padding: 20px;
  display: flex;
  justify-content: center;
}

.avatar-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: #dbeafe;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #1e40af;
  font-size: 2.5rem;
  font-weight: bold;
}

.member-info {
  padding: 0 20px 20px;
  flex-grow: 1;
}

.member-info h4 {
  color: #1e40af;
  font-size: 1.3rem;
  margin-bottom: 5px;
  text-align: center;
}

.member-title {
  color: #4b5563;
  font-weight: 500;
  margin-bottom: 10px;
  text-align: center;
}

.member-desc {
  color: #6b7280;
  font-size: 0.95rem;
  line-height: 1.6;
}

.department-nav {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 10px;
}

.dept-btn {
  padding: 8px 16px;
  background-color: #f3f4f6;
  border: none;
  border-radius: 20px;
  color: #4b5563;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dept-btn:hover {
  background-color: #e5e7eb;
}

.dept-btn.active {
  background-color: #1e40af;
  color: white;
}

.alumni-section {
  background-color: #f9fafb;
  padding: 40px;
  border-radius: 8px;
}

.alumni-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.alumni-year {
  display: flex;
  gap: 20px;
}

.year-marker {
  min-width: 100px;
  font-weight: bold;
  color: #1e40af;
  font-size: 1.2rem;
}

.alumni-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.alumni-item {
  background-color: white;
  padding: 10px 15px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.alumni-name {
  font-weight: 500;
  color: #1e40af;
}

.alumni-role {
  font-size: 0.85rem;
  color: #6b7280;
}

.join-team-section {
  text-align: center;
  background-color: #dbeafe;
  padding: 50px;
  border-radius: 8px;
  margin-top: 60px;
}

.join-team-section h3 {
  color: #1e40af;
  font-size: 1.8rem;
  margin-bottom: 20px;
}

.join-team-section p {
  color: #4b5563;
  max-width: 600px;
  margin: 0 auto 30px;
  line-height: 1.7;
}

.join-btn {
  display: inline-block;
  padding: 12px 25px;
  background-color: #1e40af;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.join-btn:hover {
  background-color: #1e3a8a;
}

@media (max-width: 768px) {
  .team-members {
    grid-template-columns: 1fr;
  }
  
  .alumni-year {
    flex-direction: column;
    gap: 10px;
  }
  
  .year-marker {
    min-width: auto;
  }
  
  .join-team-section {
    padding: 30px 20px;
  }
}
</style> 