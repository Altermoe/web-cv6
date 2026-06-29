<script setup lang="ts">
/**
 * CivilizationPicker — 文明/领袖选择面板
 * 左栏：下拉选择文明领袖，显示领袖特质信息
 */
import { computed } from "vue";
import { CvSelect, CvPanel, CvDivider } from "@webcv6/ui";
import type { SelectOption } from "@webcv6/ui";

const modelValue = defineModel<string>({ default: "random" });

interface Civilization {
  id: string;
  leader: string;
  civilization: string;
  ability: string;
  unit: string;
}

const civilizations: Civilization[] = [
  {
    id: "random",
    leader: "🎲 随机领袖",
    civilization: "随机选择",
    ability: "随机一位领袖",
    unit: "—",
  },
  {
    id: "cleopatra",
    leader: "克利奥帕特拉",
    civilization: "埃及",
    ability: "尼罗河馈赠：沿河城市产出+2 金币",
    unit: "战车弓箭手",
  },
  {
    id: "julius_caesar",
    leader: "尤利乌斯·凯撒",
    civilization: "罗马",
    ability: "全部道路：建造者+1 移动力",
    unit: "罗马军团",
  },
  {
    id: "qin_shi_huang",
    leader: "秦始皇",
    civilization: "中国",
    ability: "万世一系：奇观建造+15%",
    unit: "虎蹲炮",
  },
  {
    id: "victoria",
    leader: "维多利亚",
    civilization: "英国",
    ability: "日不落帝国：海外城市+2 产出",
    unit: "红衣军",
  },
  {
    id: "harald_hadrada",
    leader: "哈拉尔德·哈德拉达",
    civilization: "挪威",
    ability: "维京恐惧：海军近战+50% 对抗码头",
    unit: "龙头长船",
  },
  {
    id: "pedro_ii",
    leader: "佩德罗二世",
    civilization: "巴西",
    ability: "狂欢节：大音乐家点数+100%",
    unit: "米拉斯骑兵",
  },
  {
    id: "montezuma",
    leader: "蒙特祖马",
    civilization: "阿兹特克",
    ability: "鹰之奉献：奢侈资源+2 威力",
    unit: "美洲虎战士",
  },
  {
    id: "saladin",
    leader: "萨拉丁",
    civilization: "阿拉伯",
    ability: "智慧之光：信仰产出+25%",
    unit: "马穆鲁克",
  },
  {
    id: "tomyris",
    leader: "托米丽司",
    civilization: "斯基泰",
    ability: "草原之民：击杀单位后恢复生命",
    unit: "骑射手",
  },
  {
    id: "mulusse_edirissi",
    leader: "姆利斯·伊迪里西",
    civilization: "努比亚",
    ability: "非洲交汇：远程单位+1 射程",
    unit: "皮塔提弓箭手",
  },
  {
    id: "gandhi",
    leader: "甘地",
    civilization: "印度",
    ability: "非暴力不合作：厌战度-50%",
    unit: "突击步兵",
  },
  {
    id: "catherine_de_medici",
    leader: "凯瑟琳·德·美第奇",
    civilization: "法国",
    ability: "间谍网络：所有间谍+1 等级",
    unit: "帝国卫队",
  },
  {
    id: "wilfrid_laurier",
    leader: "威尔弗里德·劳雷尔",
    civilization: "加拿大",
    ability: "和平之国：无法主动宣战，外交点数+1",
    unit: "极地探险家",
  },
  {
    id: "joao_iii",
    leader: "若昂三世",
    civilization: "葡萄牙",
    ability: "海外贸易：商路+2 金币",
    unit: "卡拉维尔帆船",
  },
  {
    id: "seondeok",
    leader: "善德女王",
    civilization: "韩国",
    ability: "花郎道：学院相邻加成翻倍",
    unit: "花郎",
  },
  {
    id: "menelik_ii",
    leader: "孟尼利克二世",
    civilization: "埃塞俄比亚",
    ability: "信仰与信仰：信仰可购买任意区域",
    unit: "奥罗莫战士",
  },
  {
    id: "lady_tiye",
    leader: "泰伊",
    civilization: "埃及",
    ability: "尼罗河馈赠：沿河城市产出+2 金币",
    unit: "战车弓箭手",
  },
];

const civOptions: SelectOption[] = civilizations.map((c) => ({
  label: `${c.leader} — ${c.civilization}`,
  value: c.id,
}));

const selectedCiv = computed(
  () => civilizations.find((c) => c.id === modelValue.value) ?? civilizations[0],
);
</script>

<template>
  <CvPanel title="文明与领袖" class="civ-picker">
    <div class="civ-picker__select">
      <CvSelect
        v-model="modelValue"
        :options="civOptions"
        placeholder="选择文明领袖..."
        size="lg"
      />
    </div>

    <CvDivider ornamental />

    <div class="civ-picker__info">
      <div class="civ-picker__leader">
        <span class="civ-picker__leader-icon">👑</span>
        <span class="civ-picker__leader-name">{{ selectedCiv.leader }}</span>
      </div>
      <div class="civ-picker__civ-name">{{ selectedCiv.civilization }}</div>

      <div class="civ-picker__detail">
        <span class="civ-picker__detail-label">领袖特质</span>
        <span class="civ-picker__detail-value">{{ selectedCiv.ability }}</span>
      </div>

      <div class="civ-picker__detail">
        <span class="civ-picker__detail-label">独特单位</span>
        <span class="civ-picker__detail-value">{{ selectedCiv.unit }}</span>
      </div>
    </div>
  </CvPanel>
</template>

<style scoped>
.civ-picker {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.civ-picker__select {
  width: 100%;
}
.civ-picker__info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.civ-picker__leader {
  display: flex;
  align-items: center;
  gap: 8px;
}
.civ-picker__leader-icon {
  font-size: 20px;
}
.civ-picker__leader-name {
  font-family: var(--civ-font-display);
  font-size: 18px;
  font-weight: 600;
  color: var(--civ-gold-300);
}
.civ-picker__civ-name {
  font-size: 14px;
  color: var(--civ-text-secondary);
  letter-spacing: 1px;
}
.civ-picker__detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--civ-radius-sm);
  border-left: 2px solid var(--civ-gold-700);
}
.civ-picker__detail-label {
  font-size: 11px;
  color: var(--civ-text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
}
.civ-picker__detail-value {
  font-size: 13px;
  color: var(--civ-text-primary);
  line-height: 1.4;
}
</style>
