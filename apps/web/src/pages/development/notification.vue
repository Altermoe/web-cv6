<script setup lang="ts">
</script>

<template>
  <div class="doc-page">
    <h1 class="doc-page__title">Notification 游戏通知</h1>
    <p class="doc-page__desc">游戏内通知系统，显示回合开始、事件触发、单位就绪等消息。</p>
    <div class="doc-todo">
      <span class="doc-todo__badge">TODO</span>
      <p>该组件尚未实现，将在后续迭代中完成。</p>
    </div>
  </div>
</template>

<style scoped>
.doc-page__title {
  font-family: var(--civ-font-display);
  font-size: 28px;
  color: var(--civ-gold-400);
  margin-bottom: 8px;
}
.doc-page__desc {
  color: var(--civ-text-secondary);
  margin-bottom: 24px;
}
.doc-todo {
  padding: 32px;
  text-align: center;
  background: var(--civ-bg-surface);
  border: 1px dashed var(--civ-gold-700);
  border-radius: var(--civ-radius-md);
  color: var(--civ-text-muted);
}
.doc-todo__badge {
  display: inline-block;
  padding: 4px 12px;
  background: var(--civ-gold-700);
  color: var(--civ-gold-400);
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  margin-bottom: 12px;
}
</style>
