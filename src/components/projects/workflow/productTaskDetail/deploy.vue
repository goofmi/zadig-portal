<template>
  <div class="task-detail-deploy">
    <el-card v-if="deploys.length > 0"
             class="box-card task-process"
             :body-style="{ margin: '15px 0 0 0' }">
      <div slot="header"
           class="clearfix subtask-header">
        <span>容器部署</span>
        <div v-if="deploys[0].status==='running'"
             class="loader">
          <div class="ball-scale-multiple">
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>
      <div v-for="(deploy,index) in deploys"
           :key="index"
           class="deploy-item">
        <div class="error-wrapper">
          <el-alert v-if="deploy.error"
                    title="错误信息"
                    :description="deploy.error"
                    type="error"
                    close-text="知道了">

          </el-alert>
        </div>
        <el-row :gutter="0">
          <el-col :span="6">
            <div class="grid-content item-title">
              <i class="iconfont iconzhuangtai"></i> 部署状态
            </div>
          </el-col>
          <el-col :span="6">
            <div class="grid-content item-desc"
                 :class="$translate.calcTaskStatusColor(deploy.status)">
              {{deploy.status?$translate.translateTaskStatus(deploy.status):"未运行"}}
            </div>
          </el-col>
          <el-col :span="6">
            <div class="grid-content item-title">
              <i class="iconfont iconjiqun1"></i> 部署环境
            </div>
          </el-col>
          <el-col :span="6">
            <div class="grid-content item-desc">
              <router-link class="env-link"
                           :to="`/v1/projects/detail/${deploy.product_name}/envs/detail?envName=${deploy.env_name}`">
                {{deploy.env_name}}</router-link>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="0">
          <el-col :span="6">
            <div class="grid-content item-title">
              <i class="iconfont iconSliceCopy"></i> 镜像信息
            </div>
          </el-col>
          <el-col :span="6">
            <el-tooltip effect="dark"
                        :content="deploy.image"
                        placement="top">
              <div class="grid-content item-desc">{{deploy.image?deploy.image.split('/')[2]:"*"}}
              </div>
            </el-tooltip>
          </el-col>
          <el-col :span="6">
            <div class="grid-content item-title">
              <i class="iconfont iconfuwu"></i> 服务名称
            </div>
          </el-col>
          <el-col :span="6">
            <div class="grid-content item-desc">
              <span v-if="deploy.service_type==='helm'">
                {{`${$utils.showServiceName(deploy.container_name,deploy.service_name)}`}}
              </span>
              <router-link v-else
                           class="env-link"
                           :to="serviceUrl(deploy)">
                {{deploy.service_name}}</router-link>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script>
import mixin from '@/mixin/killSSELogMixin'
import qs from 'qs'

export default {
  data () {
    return {
    }
  },
  methods: {
    serviceUrl (deploy) {
      const path = `/v1/projects/detail/${deploy.product_name}/envs/detail/${deploy.service_name}`
      const query = {
        envName: deploy.env_name,
        projectName: deploy.product_name,
        namespace: deploy.namespace,
        clusterId: deploy.cluster_id ? deploy.cluster_id : ''
      }
      return path + '?' + qs.stringify(query)
    }
  },
  props: {
    deploys: {
      type: Array,
      required: true
    },
    pipelineName: {
      type: String,
      required: true
    },
    taskID: {
      type: [String, Number],
      required: true
    }
  },
  mixins: [mixin]
}
</script>

<style lang="less">
@import "~@assets/css/component/subtask.less";

.task-detail-deploy {
  .deploy-item {
    margin-bottom: 15px;
  }

  .env-link {
    color: @themeColor;
  }
}
</style>
