<template>
  <div @mouseenter="enterSidebar" @mouseleave="leaveSidebar" class="sidebar full-h" :class="{ 'small-sidebar': !showSidebar }">
    <a @click="changeSidebar" class="sidebar-size-toggler">
      <i :class="showSidebar?'el-icon-arrow-right':'el-icon-arrow-left'"></i>
    </a>
    <div class="sidebar-header" :style="{ width: showSidebar ? '100%' : 'auto'}">
      <router-link to="/v1/status">
        <img v-if="showSidebar&&!showBackPath" class="logo" src="@assets/icons/logo/logo.svg" />
        <img v-if="!showSidebar&&!showBackPath" class="logo" src="@assets/icons/logo/small-logo.png" />
      </router-link>
      <router-link class="sidebar-header-item back-to" v-show="showSidebar&&showBackPath" :to="backUrl">
        <div class="sidebar-header__icon">
          <i class="icon el-icon-back"></i>
        </div>
        <div class="sidebar-header__info">
          <div class="logo-title">{{backTitle}}</div>
        </div>
      </router-link>
      <router-link class="sidebar-header-item" v-show="!showSidebar&&showBackPath" :to="backUrl">
        <div class="sidebar-header__icon">
          <i class="icon el-icon-back"></i>
        </div>
      </router-link>
    </div>
    <div class="nav grow-all main-menu">
      <div v-for="(item,index) in navList" :key="index" class="category-wrapper">
        <h4 v-if="navList[index].items.length > 0" class="category-name" :class="{ opened: !showSidebar }">
          {{item.category_name}}
          <span v-if="item.new_feature" class="new-feature">New</span>
        </h4>
        <div class="nav__new-wrapper" v-for="(nav,nav_index) in navList[index].items" :key="nav_index">
          <div class="nav grow-nothing">
            <div @click="collapseMenu(nav)" v-if="nav.hasSubItem" class="nav-item">
              <div class="nav-item-icon">
                <i :class="nav.icon"></i>
              </div>
              <a href="javascript:void(0)">
                <div class="nav-item-label">
                  {{nav.name}}
                  <i v-if="nav.isOpened" class="el-icon-arrow-up arrow"></i>
                  <i v-else-if="!nav.isOpened" class="el-icon-arrow-down arrow"></i>
                </div>
              </a>
            </div>
            <el-tooltip v-else effect="dark" :content="nav.name" placement="right" :disabled="showSidebar">
              <router-link class="nav-item" active-class="active" :to="`/v1/${nav.url}`">
                <div class="nav-item-icon">
                  <i :class="nav.icon"></i>
                </div>
                <div v-show="showSidebar" class="nav-item-label">{{nav.name}}</div>
              </router-link>
            </el-tooltip>
            <ul v-if="nav.hasSubItem && nav.isOpened" class="sub-menu" style="overflow: hidden;">
              <li class="sub-menu-item-group">
                <ul>
                  <router-link v-for="(subItem,index) in nav.subItems" :key="index" active-class="active" :to="`/v1/${subItem.url}`">
                    <li class="sub-menu-item">
                      <span class="sub-item-icon">
                        <i :class="subItem.icon"></i>
                      </span>
                      <span class="sub-item-label">{{subItem.name}}</span>
                    </li>
                  </router-link>
                </ul>
              </li>
            </ul>
          </div>
        </div>

        <div class="nav__new-wrapper"></div>
      </div>
    </div>
  </div>
</template>

<script>
import bus from '@utils/eventBus'
import _ from 'lodash'
export default {
  data () {
    return {
      showSidebar: true,
      backTitle: '',
      backUrl: '/v1/status',
      systemMenu: [
        {
          category_name: '集成管理',
          items: [
            {
              name: '系统集成',
              icon: 'iconfont iconicon_jichengguanli',
              url: 'system/integration'
            },
            {
              name: '软件包管理',
              icon: 'iconfont iconyingyongshezhi',
              url: 'system/apps'
            },
            {
              name: '构建镜像管理',
              icon: 'iconfont iconjingxiang',
              url: 'system/imgs'
            },
            {
              name: '工作流任务',
              icon: 'iconfont el-icon-sell',
              url: 'system/plugins'
            }
          ]
        },
        {
          category_name: '基础设施',
          items: [
            {
              name: '镜像仓库',
              icon: 'iconfont icondocker',
              url: 'system/registry'
            },
            {
              name: '对象存储',
              icon: 'iconfont iconduixiangcunchu',
              url: 'system/storage'
            },
            {
              name: 'HELM 仓库',
              icon: 'iconfont iconhelmrepo',
              url: 'system/helm',
              features: 'helm'
            },
            {
              name: '集群管理',
              icon: 'iconfont iconjiqun',
              url: 'system/cluster'
            },
            {
              name: '主机管理',
              icon: 'iconfont iconzhuji',
              url: 'system/host'
            }
          ]
        },
        {
          category_name: '系统',
          items: [
            {
              name: '系统配置',
              icon: 'iconfont iconfuwupeizhi',
              url: 'system/config'
            },
            {
              name: '用户管理',
              icon: 'iconfont icongeren',
              url: 'system/users'
            },
            {
              name: '公告管理',
              icon: 'iconfont icongonggao',
              url: 'system/announcement'
            },
            {
              name: '操作日志',
              icon: 'iconfont iconiconlog',
              url: 'system/auditlog'
            }
          ]
        }
      ],
      defaultMenu: [
        {
          category_name: '产品交付',
          items: [
            {
              name: '运行状态',
              icon: 'iconfont iconyunhangzhuangtai',
              url: 'status'
            },
            {
              name: '项目',
              icon: 'iconfont iconxiangmuloading',
              url: 'projects'
            },
            {
              name: '测试中心',
              url: 'tests',
              icon: 'iconfont iconvery-testing'
            },
            {
              name: '交付中心',
              url: 'delivery',
              icon: 'iconfont iconvery-deli'
            }
          ]
        },
        {
          category_name: '数据视图',
          items: [
            {
              name: '数据概览',
              icon: 'iconfont iconvery-dataov',
              url: 'statistics'
            },
            {
              name: '效能洞察',
              icon: 'iconfont iconvery-datain',
              url: 'insight'
            }
          ]
        }
      ],
      adminMenu: [
        {
          category_name: '设置',
          items: [
            {
              name: '系统设置',
              icon: 'iconfont iconvery-setting',
              url: 'system'
            }
          ]
        }
      ]
    }
  },
  methods: {
    enterSidebar: _.debounce(function () {
      // this.showSidebar = true
    }, 300),
    leaveSidebar: _.debounce(function () {
      // this.showSidebar = false
    }, 100),
    changeSidebar () {
      this.showSidebar = !this.showSidebar
      this.$emit('sidebar-width', this.showSidebar)
    },
    collapseMenu (nav) {
      nav.isOpened = !nav.isOpened
    }
  },
  computed: {
    showBackPath () {
      const path = this.$route.path
      if (path.includes('/v1/users')) {
        this.backTitle = '用户管理'
        return true
      } else if (path.includes('/v1/system')) {
        this.backTitle = '系统设置'
        return true
      } else {
        return false
      }
    },
    isAdmin () {
      if (this.$store.state.login.role.includes('admin')) {
        return true
      } else {
        return false
      }
    },
    showEfficiencyInsight () {
      const showEfficiencyInsight = this.checkPermissionSyncMixin({
        type: 'system',
        action: 'efficiency_over'
      })
      return showEfficiencyInsight
    },
    showDataOverview () {
      const showDataOverview = this.checkPermissionSyncMixin({
        type: 'system',
        action: 'data_over'
      })
      return showDataOverview
    },
    showTestCenter () {
      const showTestCenter = this.checkPermissionSyncMixin({
        type: 'system',
        action: 'get_test'
      })
      return showTestCenter
    },
    showDeliveryCenter () {
      const showDeliveryCenter = this.checkPermissionSyncMixin({
        type: 'system',
        operator: 'or',
        actions: ['release_get', 'delivery_get']
      })
      return showDeliveryCenter
    },
    navList () {
      const path = this.$route.path
      if (path.includes('/v1/system')) {
        return this.systemMenu
      } else if (this.isAdmin) {
        return this.defaultMenu.concat(this.adminMenu)
      } else {
        const cloneMenu = _.cloneDeep(this.defaultMenu)
        if (!this.showTestCenter) {
          _.remove(cloneMenu[0].items, (item) => {
            return item.name === '测试中心'
          })
        }
        if (!this.showDataOverview) {
          _.remove(cloneMenu[1].items, (item) => {
            return item.name === '数据概览'
          })
        }
        if (!this.showEfficiencyInsight) {
          _.remove(cloneMenu[1].items, (item) => {
            return item.name === '效能洞察'
          })
        }
        if (!this.showDeliveryCenter) {
          _.remove(cloneMenu[0].items, (item) => {
            return item.name === '交付中心'
          })
        }
        return cloneMenu
      }
    }
  },
  watch: {
    showSidebar: function (new_val, old_val) {
      this.$store.commit('SET_SIDEBAR_STATUS', new_val)
    }
  },
  created () {
    bus.$on('show-sidebar', params => {
      this.showSidebar = params
    })
  }
}
</script>

<style lang="less">
@twoSidesWidth: 12px;

.sidebar {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: left;
  justify-content: space-between;
  width: 176px;
  height: 100%;
  margin-right: 0;
  background-color: @sidebarBg;
  transition: width 200ms, margin-width 180ms;

  .sidebar-size-toggler {
    position: absolute;
    right: 0;
    bottom: 120px;
    z-index: 1;
    display: block;
    width: 16px;
    height: 48px;
    color: #fff;
    line-height: 48px;
    text-align: center;
    text-decoration: none;
    background-color: #c0c4cc;
    border-radius: 4px 0 0 4px;
    cursor: pointer;

    i {
      display: inline-block;
      transform: rotateZ(180deg);
    }
  }

  h4 {
    &.category-name {
      display: inline-block;
      width: 100%;
      margin-top: 0;
      margin-bottom: 8px;
      padding-left: 16px;
      overflow: hidden;
      color: #888;
      font-weight: 300;
      font-size: 16px;
      white-space: nowrap;
      text-align: left;
      text-transform: uppercase;

      i {
        position: relative;
        top: -1px;
        display: inline-block;
        font-size: 9px;
      }

      .new-feature {
        padding: 1px 3px;
        color: #e02711;
        font-weight: 300;
        font-size: 11px;
        border: 1px solid #e02711;
        border-radius: 4px;
      }

      &.opened {
        visibility: hidden;
      }
    }
  }

  .nav {
    flex-basis: 0;
    width: 100%;
    margin-bottom: 0;
    padding-left: 0;
    overflow: auto;
    overflow-x: hidden;
    list-style: none;

    &.grow-all {
      flex-grow: 1;
    }

    &.grow-nothing {
      flex-grow: 0;
      padding: 2px 0;
    }

    &.main-menu {
      margin-top: 14px;
    }
  }

  .category-wrapper {
    position: relative;
    flex: none !important;
    margin-right: @twoSidesWidth;
    margin-bottom: 28px;
    margin-left: @twoSidesWidth;

    &:last-child {
      margin-bottom: 0;
    }

    &.divider {
      &::before {
        position: absolute;
        top: 0;
        right: 0;
        left: 4px;
        width: 30px;
        height: 1px;
        margin: auto;
        background-color: #c0c4cc;
        content: '';
      }
    }
  }

  .sub-menu {
    position: relative;
    margin: 0;
    padding-left: 0;
    list-style: none;
    background-color: #fff;
    border-right: solid 1px #e6e6e6;

    .sub-menu-item {
      position: relative;
      box-sizing: border-box;
      min-width: 200px;
      height: 38px;
      padding: 0 35px;
      color: #303133;
      font-size: 14px;
      line-height: 38px;
      white-space: nowrap;
      list-style: none;
      cursor: pointer;
      transition: border-color 0.3s, background-color 0.3s, color 0.3s;

      &:hover {
        background-color: #e1edfa;
      }

      .sub-item-icon {
        display: inline-block;
        width: 35px;
        text-align: center;

        i {
          color: @themeColor;
          font-size: 19px;
        }
      }

      .sub-item-label {
        padding-left: 0;
        color: #434548;
        font-size: 13px;
        line-height: 2.2;
        text-align: left;
      }
    }

    .sub-menu-item-group > ul {
      padding: 0;
    }
  }

  &.small-sidebar {
    box-sizing: border-box;
    width: 80px;

    .sub-menu {
      .sub-menu-item {
        padding: 0;

        .sub-item-icon {
          width: 65px;
        }
      }
    }
  }

  .sub-menu-item-group {
    .active {
      .sub-menu-item {
        background-color: #e1edfa;
      }
    }
  }

  .sidebar-header__icon {
    display: flex;
    align-items: center;
    color: @themeColor;
    font-weight: normal;
    font-size: 16px;
  }

  .sidebar-header__info {
    padding: 20px 0;

    .logo-title {
      color: #434548;
      font-weight: 400;
      font-size: 14px;
      line-height: 22px;
      text-transform: uppercase;
    }

    .logo-title_subtitle {
      max-width: 160px;
      margin-top: 5px;
      overflow: hidden;
      color: @themeColor;
      font-size: 12px;
      line-height: 16px;
      white-space: nowrap;
      text-align: left;
      text-overflow: ellipsis;
    }
  }

  .sidebar-header {
    display: flex;
    justify-content: center;
    width: 100%;

    .sidebar-header-item {
      display: flex;
      justify-content: center;
      width: 100%;
      padding: 10px 30px;
    }

    .back-to {
      justify-content: flex-start;

      .sidebar-header__info {
        margin-left: 5px;
        padding: 0;
      }

      .sidebar-header__icon {
        width: 22px;
      }
    }

    .logo {
      height: 24px;
      padding: 14px;
      background-size: cover;

      &.small {
        width: 50px;
        height: 50px;
        margin: 0 auto;
        padding: 0;
      }
    }
  }

  .nav-item-icon {
    display: flex;
    flex-grow: 0;
    align-items: center;
    justify-content: center;
    margin: 0;
    padding: 0;
    color: @themeColor;
    font-size: 22px;
    text-align: center;

    .iconfont {
      font-size: 22px;
    }
  }

  .nav-item {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 10px 17px 10px 17px;
    overflow: hidden;
    outline: none;

    .nav-item-label {
      display: flex;
      align-items: center;
      min-width: 130px;
      margin-left: 17px;
      padding-left: 0;
      color: #4a4a4a;
      font-weight: 400;
      font-size: 14px;
      line-height: 22px;
      white-space: nowrap;
      text-align: left;

      .arrow {
        position: static;
        margin-top: -3px;
        margin-left: 8px;
        vertical-align: middle;
      }
    }
  }

  .nav-item.active,
  .nav-item:hover {
    background-color: @sidebarActiveColor;
    border-radius: 6px;

    .nav-item-label {
      color: @themeColor;
    }
  }

  .category-wrapper:first-child {
    margin-top: 0;
  }

  .nav__new-wrapper {
    position: relative;
  }

  .nav-item-bottom {
    margin-top: auto;
  }
}
</style>
