<template>
  <el-drawer size="280px" :model-value="sysStore.setting" :with-header="false" append-to-body :show-close="false" @close="sysStore.setting = false">
    <div class="drawer-container">
      <div>
        <div class="setting-drawer-content">
          <div class="setting-drawer-title">
            <h3 class="drawer-title">主题风格设置</h3>
          </div>
          <div class="setting-drawer-block-checkbox">
            <div class="setting-drawer-block-checkbox-item" @click="handleTheme('theme-dark')">
              <img src="@/assets/icon/svg/dark.svg" alt="dark" />
              <div v-if="sideTheme === 'theme-dark'" class="setting-drawer-block-checkbox-selectIcon">
                <i aria-label="图标: check" class="anticon anticon-check">
                  <svg viewBox="64 64 896 896" data-icon="check" width="1em" height="1em" :fill="theme" aria-hidden="true" focusable="false">
                    <path
                      d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 0 0-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8z"
                    />
                  </svg>
                </i>
              </div>
            </div>
            <div class="setting-drawer-block-checkbox-item" @click="handleTheme('theme-light')">
              <img src="@/assets/icon/svg/light.svg" alt="light" />
              <div v-if="sideTheme === 'theme-light'" class="setting-drawer-block-checkbox-selectIcon">
                <i aria-label="图标: check" class="anticon anticon-check">
                  <svg viewBox="64 64 896 896" data-icon="check" width="1em" height="1em" :fill="theme" aria-hidden="true" focusable="false">
                    <path
                      d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 0 0-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8z"
                    />
                  </svg>
                </i>
              </div>
            </div>
          </div>

          <div class="drawer-item">
            <span>主题颜色</span>
            <el-color-picker :predefine="['#1861EA', '#409EFF', '#304156', '#212121', '#11a983', '#13c2c2', '#6959CD', '#f5222d']" v-model="theme" @change="themeChange(theme)" />
          </div>
        </div>

        <el-divider />

        <h3 class="drawer-title">系统布局配置</h3>

        <div class="drawer-item">
          <span>动态水印</span>
          <el-switch v-model="watermark" class="drawer-switch" />
        </div>

        <el-divider />

        <el-button type="primary" plain :icon="'documentAdd'" @click="saveSetting">保存配置</el-button>
        <el-button plain :icon="'refresh'" @click="resetSetting">重置配置</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { useSysStore } from '@/store/modules/sys'
const sysStore = useSysStore()

const theme = ref(sysStore.theme)
const sideTheme = ref(sysStore.sideTheme)
const watermark = ref(sysStore.watermark)

function handleTheme(themeName: string) {
  sideTheme.value = themeName
}

function themeChange(newTheme: string) {
  theme.value = newTheme
}

function saveSetting() {
  sysStore.theme = theme.value
  sysStore.sideTheme = sideTheme.value
  sysStore.watermark = watermark.value
  sysStore.saveThemeConfig()
  sysStore.setting = false
}

function resetSetting() {
  sysStore.resetThemeConfig()
  sysStore.setting = false
}

watchEffect(() => {
  theme.value = sysStore.theme
  watermark.value = sysStore.watermark
})
</script>

<style scoped lang="scss">
.setting-drawer-content {
  padding-bottom: 16px;
}

.drawer-title {
  margin: 12px 0;
  font-size: 14px;
}

.drawer-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px 0;
  span {
    color: rgba(0, 0, 0, 0.65);
    font-size: 14px;
  }
}

.setting-drawer-block-checkbox-item {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  margin-right: 10px;
  position: relative;
  img {
    width: 48px;
    height: 54px;
  }
}

.setting-drawer-block-checkbox-selectIcon {
  color: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 15px;
  right: 0;
  bottom: 0;
  top: 8px;
  margin: auto;
}
</style>
