<template>
  <div class="stage">
    <el-tooltip effect="dark" :content="stageInfo.name" placement="top">
      <div class="stage-name">{{ $utils.tailCut(stageInfo.name,10) }}</div>
    </el-tooltip>
    <div v-for="(item,index) in stageInfo.jobs" :key="index" @click="setCurIndex(index,item)" class="job-wrap">
      <el-tooltip placement="top-start" effect="dark" width="200" trigger="hover" :content="item.name">
        <span class="job-name">{{item.name}}</span>
      </el-tooltip>
      <div class="del" @click="delJob(item,index)" v-if="isShowJobAddBtn">
        <i class="el-icon-close"></i>
      </div>
    </div>
    <el-drawer title="选择任务" :visible.sync="isShowJobOperateDialog" direction="rtl" :modal-append-to-body="false" class="drawer" size="24%">
      <JobOperate :jobInfo="jobInfo" @change="setJob" ref="jobOperate" />
    </el-drawer>
    <el-button @click="addJob" v-if="isShowJobAddBtn" size="small" class="add">+ 任务</el-button>
  </div>
</template>

<script>
import JobOperate from './jobOperate.vue'
import { jobType } from './config'
export default {
  name: 'Stage',
  components: {
    JobOperate
  },
  props: {
    value: {
      type: Object,
      default: () => ({})
    },
    curJobIndex: {
      type: Number,
      default: 0
    },
    isShowJobAddBtn: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      jobType,
      jobInfos: {
        'zadig-build': {
          name: 'default',
          type: 'zadig-build',
          spec: {
            docker_registry_id: '',
            service_and_builds: []
          }
        },
        'zadig-deploy': {
          name: 'default',
          type: 'zadig-deploy',
          env: '',
          spec: {
            env: '',
            source: '',
            job_name: ''
          }
        },
        freestyle: {
          name: 'default',
          type: 'freestyle',
          isCreate: true, // 保存时删掉
          spec: {
            properties: {
              timeout: 60,
              res_req: 'low', // high/medium/low/min/define
              res_req_spec: {
                cpu_limit: 1000,
                memory_limit: 512
              },
              cluster_id: '',
              build_os: 'focal', // 与 image_id 对应
              image_id: '',
              image_from: 'koderover', // custom/koderover
              envs: [],
              cache_enable: true,
              cache_dir_type: 'workspace', // workspace/user_defined
              cache_user_dir: ''
            },
            outputs: [
              {
                name: 'output',
                description: 'value pass to other job'
              }
            ],
            steps: [
              {
                name: 'tools',
                type: 'tools',
                spec: {
                  installs: [] // name: 'go', version: '1.13'
                }
              },
              {
                name: 'git',
                type: 'git',
                spec: {
                  repos: []
                }
              }
              // 添加步骤时的数据结构，新建时无
              // {
              //   name: 'shell',
              //   type: 'shell',
              //   spec: {
              //     script: '#!/bin/bash\nset -e'
              //   }
              // },
              // {
              //   name: 'archive',
              //   type: 'archive',
              //   spec: {
              //     object_storage_id: 'xxxxxxx',
              //     upload_detail: [] // { file_path: '', dest_path: '' }
              //   }
              // }
            ]
          }
        },
        plugin: {
          type: 'plugin',
          name: 'default',
          isCreate: true,
          description: '',
          properties: {
            timeout: 60,
            res_req: 'low', // high/medium/low/min/define
            res_req_spec: {
              cpu_limit: 1000,
              memory_limit: 512
            },
            cluster_id: ''
          },
          is_offical: true
        }
      },
      jobInfo: {},
      isShowJobOperateDialog: false
    }
  },
  computed: {
    stageInfo: {
      get () {
        return this.value
      },
      set (val) {
        this.$emit('input', val)
      }
    },
    JobIndex: {
      get () {
        return this.curJobIndex
      },
      set (val) {
        this.$emit('update:curJobIndex', val)
      }
    },
    isShowFooter () {
      return this.$store.state.customWorkflow.isShowFooter
    }
  },
  methods: {
    addJob () {
      if (this.stageInfo.jobs.length > 0) {
        if (this.isShowFooter) {
          this.$message.error('请先保存上一个任务配置')
        } else {
          this.isShowJobOperateDialog = true
        }
      } else {
        this.isShowJobOperateDialog = true
      }
    },
    delJob (item, index) {
      this.$confirm(`确定删除任务 [${item.name}]？`, '确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(res => {
        this.stageInfo.jobs.splice(index, 1)
        this.$store.dispatch('setIsShowFooter', false)
        this.JobIndex = -2
      })
    },
    setCurIndex (index) {
      this.JobIndex = index
      this.$store.dispatch('setIsShowFooter', true)
    },
    setJob (newVal) {
      if (Object.keys(newVal).length === 0) {
        return
      }
      if (newVal.type === 'plugin') {
        this.stageInfo.jobs.push(newVal)
      } else {
        this.stageInfo.jobs.push(this.jobInfos[newVal.type])
      }
      this.JobIndex = this.stageInfo.jobs.length - 1
      this.isShowJobOperateDialog = false
      this.$store.dispatch('setIsShowFooter', true)
    }
  }
}
</script>

<style lang="less" scoped>
.stage {
  text-align: center;

  .drawer {
    color: #555;
    text-align: left;

    /deep/ .el-drawer.rtl,
    .el-drawer__container {
      top: auto;
      right: 0;
      bottom: 0;
      height: calc(~'100% - 102px') !important;
    }

    /deep/.el-drawer__body {
      padding: 0 24px;
    }
  }

  &-name {
    margin-right: 16px;
    margin-left: 16px;
    padding-left: -8px;
    overflow: hidden;
    color: #121212;
    font-size: 14px;
    line-height: 24px;
    text-align: left;
    border-bottom: 1px solid @borderGray;
    cursor: pointer;
  }

  .job-wrap {
    position: relative;
    width: 7em;
    margin: 8px auto;
    overflow: hidden;
    color: #555;
    font-size: 14px;
    line-height: 30px;
    white-space: nowrap;
    text-overflow: ellipsis;
    border: 1px solid @borderGray;
    border-radius: 2px;
    cursor: pointer;

    .del {
      position: absolute;
      top: -8px;
      right: 0;
      display: none;
      font-size: 14px;
    }

    &:hover {
      color: #000;

      .del {
        display: block;
      }
    }
  }

  .add {
    width: 7em;
    margin-top: 8px;
    font-size: 14px;
    border: 2px dotted @borderGray;
  }
}
</style>
