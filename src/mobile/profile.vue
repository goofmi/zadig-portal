<template>
  <div class="mobile-profile">
    <van-nav-bar left-arrow
                 @click-left="mobileGoback">
      <template #title>
        {{username}}
      </template>
    </van-nav-bar>
    <div v-if="loading"
         class="load-cover">
      <van-loading type="spinner"
                   color="#0066ff" />
    </div>

    <template v-else>
      <van-panel title="用户名"
                 :desc="username"
                 :status="userRole">
      </van-panel>
      <van-panel title="用户来源"
                 :desc="from">
      </van-panel>
      <van-panel title="最近登录"
                 :desc="$utils.convertTimestamp(currentEditUserInfo.info.last_login_time)">
      </van-panel>
      <van-panel v-if="jwtToken"
                 title="API Token"
                 :desc="jwtToken">
      </van-panel>
      <div class="logout">
        <van-button type="danger"
                    @click="logout"
                    round
                    block>退出登录</van-button>
      </div>

    </template>

  </div>

</template>
<script>
import { NavBar, Tag, Panel, Loading, Button, Notify } from 'vant'
import store from 'storejs'
export default {
  components: {
    [NavBar.name]: NavBar,
    [Tag.name]: Tag,
    [Panel.name]: Panel,
    [Loading.name]: Loading,
    [Button.name]: Button,
    [Notify.name]: Notify
  },
  data () {
    return {
      loading: false,
      jwtToken: null,
      currentEditUserInfo: {
        info: {
          id: 5,
          name: '',
          email: '',
          password: '',
          phone: '',
          isAdmin: true,
          isSuperUser: false,
          organization_id: 0,
          directory: 'system',
          teams: []
        },
        teams: [],
        organization: {
          id: 1,
          name: '',
          token: '',
          website: ''
        }
      }

    }
  },
  methods: {
    getJwtToken () {
      this.jwtToken = store.get('userInfo').token
    },
    logout () {
      store.remove('token')
      this.$store.dispatch('clearProjectTemplates')
      this.$router.push('/signin')
      Notify({ type: 'success', message: '账号退出成功' })
    }
  },
  computed: {
    title () {
      return this.$route.meta.title
    },
    username () {
      return this.$store.state.login.userinfo.name
    },
    userRole () {
      if (this.currentEditUserInfo.info.isSuperUser) {
        return '管理员'
      } else {
        return '普通用户'
      }
    },
    from () {
      return this.currentEditUserInfo.info.directory
    }
  },
  mounted () {
    this.getJwtToken()
  }
}
</script>
<style lang="less">
.mobile-profile {
  .load-cover {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 999;
    width: 100%;
    height: calc(~"100% - 46px");
    background: rgba(255, 255, 255, 0.5);

    .van-loading {
      top: 40%;
      left: 50%;
      width: 40px;
      height: 40px;
      transform: translateX(-50%);
    }
  }

  .logout {
    margin-top: 35px;
    padding: 0 12px;
  }
}
</style>
