<template>
  <div class="helm-chart-yaml-content">
    <template v-if="showServicesTab">
      <el-input class="search-service" v-model="searchService" placeholder="搜索服务" suffix-icon="el-icon-search" size="small"></el-input>
      <el-tabs class="service-list" tab-position="left" type="border-card" v-model="selectedChart" :before-leave="switchTabs">
        <el-tab-pane :name="name.serviceName" v-for="name in filteredServiceNames" :key="name.serviceName" :disabled="name.type==='delete'">
          <template slot="label">
            <el-tooltip effect="dark" :content="name.serviceName" placement="top">
              <span class="tab-title">{{name.serviceName}}</span>
            </el-tooltip>
            <i
              class="icon"
              :class="{'el-icon-delete': name.type==='delete', 'el-icon-refresh': name.type==='update', 'el-icon-folder-add': name.type==='create'}"
            ></i>
          </template>
        </el-tab-pane>
      </el-tabs>
    </template>
    <div class="values" :class="{hidden: serviceNotHandle, 'max-width': !showServicesTab}">
      <div class="values-content">
        <el-tabs v-if="showEnvTabs" v-model="selectedEnv" :before-leave="switchTabs">
          <el-tab-pane :label="env" :name="env" v-for="env in envNames" :key="env" :disabled="disabledEnv.includes(env)"></el-tab-pane>
        </el-tabs>
        <div class="v-content" v-if="usedChartNameInfo">
          <div v-show="usedChartNameInfo.yamlSource === 'default'" class="default-values">
            <el-button type="text" @click="usedChartNameInfo.yamlSource = 'freeEdit'">添加 values 文件</el-button>
          </div>
          <ImportValues
            v-show="usedChartNameInfo.yamlSource !== 'default'"
            showDelete
            showAutoSync
            ref="importValuesRef"
            :resize="{direction: 'vertical'}"
            :importRepoInfo="usedChartNameInfo"
          ></ImportValues>
          <KeyValue
            ref="keyValueRef"
            :keyValues="usedChartNameInfo.overrideValues"
            :listKeyValues="listKeyValues"
            @estimatedValues="getCalculatedValuesYaml"
          ></KeyValue>
          <section class="review-content">
            <div class="review-title">
              <el-button type="text" @click="getReviewValuesFile">
                预览最终 values 文件
                <i style="margin-left: 8px;" :class="{'el-icon-arrow-down': showReview, 'el-icon-arrow-right': !showReview}"></i>
              </el-button>
              <el-button type="text" v-show="showReview" @click="getCalculatedValuesYaml(false)">刷新</el-button>
            </div>
            <Codemirror class="codemirror" ref="codemirror" v-if="showReview" :value="usedChartNameInfo.yamlContent" :cmOption="cmOption"></Codemirror>
          </section>
        </div>
      </div>
      <div class="mask"></div>
    </div>
  </div>
</template>

<script>
import ImportValues from '@/components/projects/common/importValues/index.vue'
import KeyValue from '@/components/projects/common/importValues/keyValue.vue'
import Codemirror from '@/components/projects/common/codemirror.vue'
import {
  getChartValuesYamlAPI,
  getAllChartValuesYamlAPI,
  getCalculatedValuesYamlAPI
} from '@api'
import { cloneDeep, pick, differenceBy, get } from 'lodash'

const chartInfoTemp = {
  envName: '', // ?: String
  serviceName: '', // : String
  chartVersion: '', // : String
  yamlSource: 'default', // : String
  overrideValues: [], // : Object{key,value}[]
  overrideYaml: '', // : String
  gitRepoConfig: null, // : Object [Not use, just record]
  yamlContent: '' // 预览 YAML 内容
}

// const allChartNameInfoTemp = {
//   serviceName: {
//     envName: chartInfoTemp
//   }
// }

export default {
  name: 'ChartValues',
  props: {
    chartNames: {
      type: Array, // Object{serviceName}[]
      required: false,
      default: () => null
    },
    envNames: {
      // when envName is different from initEnvNames, the envNames is all name
      // 环境列表
      type: Array,
      required: false,
      default: () => []
    },
    handledEnv: {
      // 正在处理的环境名称
      type: String,
      required: false
    },
    showEnvTabs: {
      // 是否展示环境tab
      default: false,
      type: Boolean,
      required: false
    },
    defaultEnvValue: {
      type: Object,
      default: () => {
        return {
          envName: '',
          defaultValues: ''
        }
      }
    },
    envScene: {
      // updateRenderSet: update env variable;  updateEnv, createEnv
      type: String,
      required: true
    },
    baseEnvObj: {
      // used for envNames is different from initEnvNames(which used to request api)
      type: Object,
      default: () => null // {envName: baseEvnName}
    },
    showServicesTab: {
      type: Boolean,
      default: true
    }
  },
  data () {
    this.cmOption = {
      readOnly: true,
      lineNumbers: false
    }
    this.defaultEnvsValues = {} // 不需要响应式 { key: envName, value: defaultEnvValue }
    return {
      allChartNameInfo: {}, // key: serviceName value: Object{ key:envName }
      selectedChart: '',
      selectedEnv: 'DEFAULT',
      disabledEnv: [],
      showReview: false,
      listKeyValues: {},
      searchService: '',
      getChartValuesFinished: 0
    }
  },
  computed: {
    serviceNames () {
      return (
        this.chartNames ||
        Object.keys(this.allChartNameInfo)
          .filter(name => {
            return this.allChartNameInfo[name][this.selectedEnv]
          })
          .map(name => {
            return { serviceName: name, type: 'common' }
          })
      )
    },
    filteredServiceNames () {
      return this.serviceNames.filter(name => {
        return name.serviceName.includes(this.searchService)
      })
    },
    projectName () {
      return this.$route.params.project_name
    },
    usedChartNameInfo () {
      // 每次切换环境或服务，预览收起、清空键值对
      this.closeReview()
      this.listKeyValues = {}
      return (
        (this.allChartNameInfo[this.selectedChart] &&
          this.allChartNameInfo[this.selectedChart][this.selectedEnv]) ||
        cloneDeep(chartInfoTemp)
      )
    },
    serviceNotHandle () {
      const current = this.serviceNames.find(
        service => service.serviceName === this.selectedChart
      )
      return (
        (current && current.type === 'delete') ||
        (this.showEnvTabs && this.selectedEnv === 'DEFAULT') ||
        (!this.selectedChart && !this.serviceNames.length)
      )
    }
  },
  methods: {
    closeReview () {
      this.showReview = false
    },
    async getCalculatedValuesYaml (kvFlag = true) {
      const envName = this.selectedEnv

      const payload = {
        overrideYaml:
          this.usedChartNameInfo.yamlSource === 'default'
            ? ''
            : this.usedChartNameInfo.overrideYaml
      }
      // 更新环境，不需要传环境默认value
      if (this.envScene !== 'updateEnv') {
        payload.defaultValues = this.defaultEnvsValues[envName] || ''
      }
      if (!kvFlag) {
        payload.overrideValues = this.usedChartNameInfo.overrideValues
      }
      const res = await getCalculatedValuesYamlAPI(
        {
          projectName: this.projectName,
          serviceName: this.selectedChart,
          envName:
            envName === 'DEFAULT'
              ? ''
              : this.baseEnvObj
                ? this.baseEnvObj[envName]
                : envName,
          format: kvFlag ? 'flatMap' : 'yaml',
          scene: this.envScene
        },
        payload
      ).catch(error => {
        console.log(error)
      })
      if (res) {
        if (kvFlag) {
          this.listKeyValues = res
        } else {
          this.usedChartNameInfo.yamlContent = res.yamlContent
        }
      }
    },
    getReviewValuesFile () {
      this.showReview = !this.showReview
      if (this.showReview) this.getCalculatedValuesYaml(false)
    },
    switchTabs () {
      const valid =
        this.$refs.importValuesRef && this.$refs.importValuesRef.validate()
      if (valid) this.showReview = false
      return valid
    },
    getAllChartNameInfo () {
      const chartValues = []
      const serviceNames = Object.keys(this.allChartNameInfo)
      const chartNameInfo = this.allChartNameInfo
      const envNames = this.envNames.length ? this.envNames : [this.selectedEnv]
      for (const serviceName in chartNameInfo) {
        if (!serviceNames.includes(serviceName)) {
          continue
        }
        const chartInfo = chartNameInfo[serviceName]
        for (const envName in chartInfo) {
          if (!envNames.includes(envName)) {
            continue
          }
          chartInfo[envName].overrideValues = chartInfo[
            envName
          ].overrideValues.filter(value => value.key !== '')
          const values = pick(chartInfo[envName], [
            'envName',
            'serviceName',
            'chartVersion',
            'overrideValues'
          ])
          values.valuesData = {
            yamlSource: 'repo',
            autoSync:
              chartInfo[envName].gitRepoConfig &&
              chartInfo[envName].gitRepoConfig.autoSync
                ? chartInfo[envName].gitRepoConfig.autoSync
                : false,
            gitRepoConfig: chartInfo[envName].gitRepoConfig
          }
          values.overrideYaml =
            chartInfo[envName].yamlSource !== 'default'
              ? chartInfo[envName].overrideYaml
              : ''
          chartValues.push(values)
        }
      }
      return chartValues
    },
    resetAllChartNameInfo () {
      this.allChartNameInfo = {}
    },
    initAllChartNameInfo (chartNames, envName = '') {
      if (!chartNames) {
        return
      }
      chartNames.forEach(chart => {
        const envInfos = {}
        envName = envName || chart.envName || 'DEFAULT' // priority: envName -> chart.envName -> 'DEFAULT'
        const initInfo = get(
          this.allChartNameInfo,
          `${chart.serviceName}.${envName}.initInfo`,
          null
        )
        envInfos[envName] = {
          ...cloneDeep(initInfo || chartInfoTemp),
          ...cloneDeep(chart),
          envName: envName === 'DEFAULT' ? '' : envName,
          yamlSource:
            (initInfo && initInfo.overrideYaml) || chart.overrideYaml
              ? 'freeEdit'
              : 'default',
          initInfo
        }
        this.$set(this.allChartNameInfo, chart.serviceName, {
          ...this.allChartNameInfo[chart.serviceName],
          ...envInfos
        })
      })
      this.selectedChart = this.chartNames.length
        ? this.chartNames[0].serviceName
        : ''
    },
    validate () {
      const valid = []
      if (this.$refs.importValuesRef) {
        valid.push(this.$refs.importValuesRef.validate())
      }
      if (this.$refs.keyValueRef) valid.push(this.$refs.keyValueRef.validate())
      return Promise.all(valid)
    },
    async getChartValuesYaml ({ envName }) {
      this.getChartValuesFinished++
      const fn =
        this.envScene === 'updateRenderSet'
          ? getChartValuesYamlAPI // get current env info
          : getAllChartValuesYamlAPI // get current project info

      const serviceNames = this.chartNames
        ? this.chartNames.map(chart => chart.serviceName)
        : [] // get all service info in current env

      const res = await fn(this.projectName, envName, serviceNames).catch(
        err => {
          this.disabledEnv.push(envName)
          console.log(err)
        }
      )
      this.getChartValuesFinished--
      if (res) {
        if (this.disabledEnv.includes(envName)) {
          const id = this.disabledEnv.indexOf(envName)
          this.disabledEnv.splice(id, 1)
        }

        res.forEach(re => {
          const envInfo = {
            ...cloneDeep(chartInfoTemp),
            ...re,
            envName,
            yamlSource: re.overrideYaml ? 'freeEdit' : 'default'
          }
          if (
            envInfo.yaml_data &&
            envInfo.yaml_data.source_detail &&
            envInfo.yaml_data.source_detail.git_repo_config &&
            envInfo.yaml_data.source_detail.git_repo_config.codehost_id
          ) {
            envInfo.gitRepoConfig = {
              branch: envInfo.yaml_data.source_detail.git_repo_config.branch,
              codehostID:
                envInfo.yaml_data.source_detail.git_repo_config.codehost_id,
              owner: envInfo.yaml_data.source_detail.git_repo_config.owner,
              repo: envInfo.yaml_data.source_detail.git_repo_config.repo,
              valuesPaths: [envInfo.yaml_data.source_detail.load_path],
              autoSync: envInfo.yaml_data.auto_sync,
              namespace: envInfo.yaml_data.source_detail.git_repo_config.namespace
            }
          }
          const allChartNameInfo = {}

          allChartNameInfo[re.serviceName] = {
            ...this.allChartNameInfo[re.serviceName]
          }
          allChartNameInfo[re.serviceName][envName] = {
            ...envInfo,
            initInfo: cloneDeep(envInfo)
          }

          this.$set(
            this.allChartNameInfo,
            re.serviceName,
            allChartNameInfo[re.serviceName]
          )
        })
        this.selectedChart = this.chartNames
          ? this.chartNames.length
            ? this.chartNames[0].serviceName
            : ''
          : res[0].serviceName
      }
    },
    copyEnvChartInfo (envName, initEnvName) {
      const services = Object.keys(this.allChartNameInfo).filter(name => {
        return this.allChartNameInfo[name][initEnvName]
      })
      if (
        this.allChartNameInfo[services[0]] &&
        this.allChartNameInfo[services[0]][envName] &&
        this.allChartNameInfo[services[0]][envName].copy
      ) {
        return
      }
      services.forEach(name => {
        const charts = this.allChartNameInfo[name]
        this.$set(charts, envName, {
          ...cloneDeep(charts[initEnvName]),
          copy: true
        })
      })
    }
  },
  watch: {
    envNames: {
      handler (newV, oldV) {
        if (newV) {
          const envNamesByGet = oldV
            ? newV.filter(nv => {
              return !oldV.includes(nv)
            })
            : newV
          this.selectedEnv =
            this.handledEnv || newV[newV.length - 1] || 'DEFAULT'
          envNamesByGet.forEach(env => {
            if (env === 'DEFAULT' || !env) {
              return
            }
            this.getChartValuesYaml({ envName: env })
          })
        }
      },
      immediate: true
    },
    handledEnv: {
      handler (newV, oldV) {
        if (newV) {
          this.selectedEnv = newV
        }
        if (newV && !this.envNames.includes(newV)) {
          this.getChartValuesYaml({ envName: newV })
        }
      },
      immediate: true
    },
    chartNames: {
      handler (newV, oldV) {
        if (newV) {
          if (newV[0] && newV[0].envName) {
            this.selectedEnv = newV[0].envName
          }
          const chartNames = oldV
            ? differenceBy(newV, oldV, 'serviceName')
            : newV
          this.initAllChartNameInfo(
            chartNames,
            this.selectedEnv || this.handledEnv
          )
        }
      },
      immediate: true
    },
    defaultEnvValue: {
      handler (newV, oldV) {
        if (newV && newV.envName) {
          this.defaultEnvsValues[newV.envName] = newV.defaultValues
        }
      },
      immediate: true
    },
    getChartValuesFinished (val) {
      if (val === 0 && this.baseEnvObj) {
        Object.keys(this.baseEnvObj).forEach(env => {
          this.copyEnvChartInfo(env, this.baseEnvObj[env])
        })
      }
    }
  },
  components: {
    ImportValues,
    KeyValue,
    Codemirror
  }
}
</script>

<style lang="less" scoped>
.helm-chart-yaml-content {
  position: relative;
  display: flex;
  box-sizing: border-box;
  width: 100%;
  max-height: 540px;

  .search-service {
    position: absolute;
    z-index: 1;
    width: 180px;

    /deep/.el-input__inner {
      width: 100%;
      height: 35px;
      line-height: 35px;
    }
  }

  /deep/.el-tabs {
    flex-shrink: 0;

    &.service-list {
      width: 180px;

      .el-tabs__nav {
        max-height: calc(~'100% - 35px');
        margin-top: 35px;
        overflow: auto;
      }
    }

    .el-tabs__header {
      margin-right: 0;

      &.is-left {
        border-right-width: 0;

        .el-tabs__item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 180px;
          font-weight: 300;
          text-align: left;

          .tab-title {
            flex: 1 1 calc(~'100% - 40px');
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }

          .icon {
            padding-left: 3px;
          }
        }
      }

      &.is-top {
        margin-bottom: 5px;
      }
    }

    .el-tabs__content {
      padding: 0;
    }

    &.el-tabs--border-card > .el-tabs__header {
      background-color: rgba(246, 246, 246, 0.6);
    }
  }

  .values {
    position: relative;
    box-sizing: border-box;
    width: calc(~'100% - 160px');
    max-height: 100%;
    padding: 0 20px;
    overflow: auto;
    border: 1px solid #dcdfe6;
    border-left-width: 0;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);

    .values-content {
      position: relative;
      z-index: 0;

      .v-content {
        padding-bottom: 10px;

        .version-title {
          height: 40px;
          line-height: 40px;
        }

        .default-values {
          margin-bottom: 14px;
        }
      }

      .review-content {
        margin-top: 20px;

        .review-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .codemirror {
          height: 200px;
          padding: 5px;
          border: 1px solid #dcdfe6;
          border-radius: 5px;
        }
      }
    }

    &.max-width {
      width: 100%;
    }

    &.hidden {
      .mask {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 1;
        background-color: rgba(255, 255, 255, 0.5);
        cursor: not-allowed;
      }
    }
  }
}
</style>
