<template>
  <div style="
    display: flex;
    flex-direction: column;
    height: 100%;">
    <router-view style="height: 100%;"></router-view>
  </div>
</template>

<script>
import moment from 'moment'
export default {
  computed: {
    processEnv () {
      return process.env
    }
  },
  mounted () {
    if (this.processEnv && this.processEnv.NODE_ENV === 'production') {
      console.log('%cHello ZADIG！', 'color: #e20382;font-size: 13px;')
      const buildInfo = []
      if (this.processEnv.VERSION) {
        buildInfo.push(`${this.processEnv.VERSION}`)
      }
      if (this.processEnv.TAG) {
        buildInfo.push(`Tag-${this.processEnv.TAG}`)
      }
      if (this.processEnv.BRANCH) {
        buildInfo.push(`Branch-${this.processEnv.BRANCH}`)
      }
      if (this.processEnv.PR) {
        buildInfo.push(`PR-${this.processEnv.PR}`)
      }
      if (this.processEnv.COMMIT_ID) {
        buildInfo.push(`${this.processEnv.COMMIT_ID.substring(0, 7)}`)
      }
      console.log(
        `%cBuild:${buildInfo.join(' ')}`,
        'color: #e20382;font-size: 13px;'
      )
      if (this.processEnv.BUILD_TIME) {
        console.log(
          `%cTime:${moment
            .unix(this.processEnv.BUILD_TIME)
            .format('YYYYMMDDHHmm')}`,
          'color: #e20382;font-size: 13px;'
        )
      }
    }
  }
}
</script>

<style lang="less">
@import url('~@assets/css/common/color.less');
@import url('~@assets/css/common/icon.less');
@import url('~@assets/css/common/common.less');
@import url('~@assets/css/common/scroll-bar.less');
@import url('~@assets/css/common/helper.less');

// Todo: Try to use perfect-scrollbar
.scrollBar();

a {
  text-decoration: none;
}

body {
  height: 100%;
  overflow: hidden;
  overflow-y: auto;
  font-family:
    'Overpass',
    'Noto Sans SC',
    -apple-system,
    BlinkMacSystemFont,
    'Helvetica Neue',
    Helvetica,
    Segoe UI,
    Arial,
    Roboto,
    'PingFang SC',
    'Hiragino Sans GB',
    'Microsoft Yahei',
    sans-serif;
  background-color: #fff;

  .el-card {
    background: #fff;
  }
}
</style>
