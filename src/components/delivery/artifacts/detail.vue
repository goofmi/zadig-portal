<template>
  <div v-loading="loading" class="artifacts-container">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="详情" name="summary">
        <el-row class="row-container" :gutter="20">
          <el-col :span="8">
            <div class="function-area">
              <div class="item-container">
                <h3 v-if="artifact.type==='image'" class="item-title">镜像信息</h3>
                <h3 v-if="artifact.type==='file'" class="item-title">文件信息</h3>
                <div class="item-detail">
                  <div>
                    <span class="key">服务名称：</span>
                    <span class="value">{{artifact.name}}</span>
                  </div>
                  <template v-if="artifact.type==='image'">
                    <div>
                      <span class="key">镜像标签：</span>
                      <el-tooltip :content="artifact.image" placement="top" effect="light">
                        <span class="value">{{artifact.image_tag}}</span>
                      </el-tooltip>
                    </div>
                    <div>
                      <span class="key">Digest：</span>
                      <span class="value">{{artifact.image_digest}}</span>
                    </div>
                    <div>
                      <span class="key">创建时间：</span>
                      <span class="value">{{ $utils.convertTimestamp(artifact.created_time)}}</span>
                    </div>
                    <div>
                      <span class="key">架构：</span>
                      <span class="value">{{artifact.architecture}}</span>
                    </div>
                    <div>
                      <span class="key">操作系统：</span>
                      <span class="value">{{artifact.os}}</span>
                    </div>
                  </template>
                  <div v-else-if="artifact.type==='file'">
                    <span class="key">创建时间：</span>
                    <span class="value">{{ $utils.convertTimestamp(artifact.created_time)}}</span>
                  </div>
                </div>
              </div>
              <div v-if="artifact.commits && artifact.commits.length > 0" class="item-container">
                <h3 class="item-title">代码信息</h3>
                <div v-for="(cm,index) in artifact.commits" :key="index" class="item-detail">
                  <div>
                    <span class="key">代码库：</span>
                    <span class="value">
                      <a
                        class="link"
                        :href="`${cm.address}/${cm.repo_owner}/${cm.repo_name}`"
                        target="_blank"
                      >{{cm.repo_owner+'/'+cm.repo_name}}</a>
                    </span>
                  </div>
                  <div v-if="cm.commit_id">
                    <span class="key">SHA：</span>
                    <span class="value">
                      <a
                        class="link"
                        :href="`${cm.address}/${cm.repo_owner}/${cm.repo_name}/commit/${cm.commit_id}`"
                        target="_blank"
                      >{{$utils.tailCut(cm.commit_id,10,' ')}}</a>
                    </span>
                  </div>
                  <div>
                    <span class="key">分支：</span>
                    <span class="value">
                      <a
                        class="link"
                        :href="`${cm.address}/${cm.repo_owner}/${cm.repo_name}/tree/${cm.branch}`"
                        target="_blank"
                      >{{cm.branch}}</a>
                    </span>
                  </div>
                  <div v-if="cm.pr">
                    <span class="key">PR：</span>
                    <span class="value">
                      <a
                        class="link"
                        :href="`${cm.address}/${cm.repo_owner}/${cm.repo_name}/merge_requests/${cm.pr}`"
                        target="_blank"
                      >{{'#' + cm.pr}}</a>
                    </span>
                  </div>
                  <div v-if="cm.commit_message">
                    <span class="key">最新提交：</span>
                    <span class="value">{{cm.commit_message}}</span>
                  </div>
                  <div v-if="cm.author_name">
                    <span class="key">提交人：</span>
                    <span class="value">{{cm.author_name}}</span>
                  </div>
                </div>
              </div>
              <div class="item-container">
                <h3 class="item-title">构建信息</h3>
                <div class="item-detail">
                  <div v-if="artifact.type==='image'">
                    <span class="key">镜像大小：</span>
                    <span class="value">{{$utils.formatBytes(artifact.image_size)}}</span>
                  </div>
                  <div v-if="this.buildUrl">
                    <span class="key">工作流：</span>
                    <router-link :to="this.buildUrl">
                      <span class="value link">{{this.buildUrlSplit}}</span>
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="function-area">
              <div class="item-container">
                <h3 class="item-title">活动时间线</h3>
                <div class="events-container">
                  <div v-for="(event,index) in artifact.activities" :key="index" class="event">
                    <el-row class="event-item">
                      <el-col :span="10">
                        <div>
                          <i class="el-icon-alarm-clock"></i>
                          {{$utils.convertTimestamp(event.created_time)}}
                        </div>
                        <div>
                          <i class="el-icon-user"></i>
                          {{event.created_by}}
                        </div>
                      </el-col>
                      <el-col :span="14">
                        <div class="event-type">
                          {{event.type}}
                          <router-link v-if="event.url" :to="event.url">
                            <i class="el-icon-link link"></i>
                          </router-link>
                        </div>
                        <div v-if="event.content">
                          <span>内容：</span>
                          <span>{{event.content}}</span>
                        </div>
                        <div v-if="event.namespace" class="event-data">
                          <span>命名空间：</span>
                          <span>{{event.namespace}}</span>
                        </div>
                        <div v-if="event.env_name" class="event-data">
                          <span>部署环境：</span>
                          <span>{{event.env_name}}</span>
                        </div>
                      </el-col>
                    </el-row>
                  </div>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="function-area">
              <div class="item-container">
                <h3 class="item-title">添加备注</h3>
                <div>
                  <el-input placeholder="请输入内容" v-model="commentContent">
                    <template slot="append">
                      <el-button
                        @click="addArtifactActivities"
                        :disabled="commentContent===''?true:false"
                        icon="el-icon-video-play add-comment"
                      ></el-button>
                    </template>
                  </el-input>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane v-if="artifact.docker_file" label="Dockerfile" name="dockerfile">
        <div class="dockerfile-container">
          <DockerFile
            v-if="collapseItemWasOpend"
            style="width: 100%; height: 100%;"
            ref="dockerfile"
            :value="artifact.docker_file"
            :options="yamlOptions"
          />
        </div>
      </el-tab-pane>
      <el-tab-pane v-if="artifact.layers" label="Layer" name="layer">
        <div class="image-layers">
          <el-row v-for="(layer,index) in artifact.layers" class="image-layers-container" :key="index">
            <el-col :span="3">
              <div v-if="layer.size" class="layer-size">{{$utils.formatBytes(layer.size)}}</div>
              <div v-else class="layer-size">0 Bytes</div>
            </el-col>
            <el-col :span="21">
              <div class="layer-code">{{layer.media_type}}</div>
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { getArtifactsDetailAPI, addArtifactActivitiesAPI } from '@api'
import bus from '@utils/eventBus'
import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/yaml/yaml.js'
import 'codemirror/theme/xq-light.css'
export default {
  data () {
    return {
      loading: false,
      collapseItemWasOpend: false,
      artifact: {
        docker_file: ''
      },
      activeName: 'summary',
      commentContent: '',
      yamlOptions: {
        tabSize: 5,
        mode: 'text/yaml',
        lineNumbers: true,
        autofocus: true,
        line: true,
        readOnly: true,
        collapseIdentical: true
      }
    }
  },
  methods: {
    getArtifactsDetail (id) {
      this.loading = true
      getArtifactsDetailAPI(id).then(res => {
        res.commits = []
        if (res.sortedActivities && res.sortedActivities.build) {
          res.sortedActivities.build.forEach(build => {
            if (build.commits) {
              res.commits = res.commits.concat(build.commits)
            }
          })
        }
        this.artifact = res
        this.loading = false
      })
    },
    handleClick (tab, event) {
      if (tab.name === 'dockerfile') {
        this.$nextTick(() => {
          this.collapseItemWasOpend = true
        })
      } else {
        this.collapseItemWasOpend = false
      }
    },
    addArtifactActivities () {
      const id = this.id
      const payload = {
        type: 'comment',
        content: this.commentContent,
        created_by: this.$store.state.login.userinfo.name
      }
      addArtifactActivitiesAPI(id, payload).then(res => {
        this.getArtifactsDetail(id)
      })
    }
  },
  computed: {
    serviceName () {
      return this.$route.query.name
    },
    id () {
      return this.$route.params.id
    },
    dockerFileYaml () {
      return this.artifact.docker_file
    },
    codemirror () {
      return this.$refs.dockerfile.codemirror
    },
    buildUrl () {
      if (
        this.artifact.sortedActivities &&
        this.artifact.sortedActivities.build &&
        this.artifact.sortedActivities.build[0]
      ) {
        return this.artifact.sortedActivities.build[0].url
      } else {
        return null
      }
    },
    buildUrlSplit () {
      return (
        this.buildUrl.split('/')[this.buildUrl.split('/').length - 2] +
        '#' +
        this.buildUrl.split('/')[this.buildUrl.split('/').length - 1]
      )
    }
  },
  created () {
    bus.$emit('set-topbar-title', {
      title: '',
      breadcrumb: [
        { title: '交付物中心', url: '/v1/delivery' },
        { title: '交付物追踪', url: '/v1/delivery/artifacts' },
        { title: this.serviceName, url: '' }
      ]
    })

    this.getArtifactsDetail(this.id)
  },
  components: {
    DockerFile: codemirror
  }
}
</script>

<style lang="less">
.artifacts-container {
  position: relative;
  flex: 1;
  padding: 24px 24px;
  overflow: auto;
  font-size: 13px;

  .add-comment {
    font-size: 18px;
    cursor: pointer;
  }

  .artifact-link,
  .link {
    color: @themeColor;
  }

  .image-layers {
    .image-layers-container {
      margin: 15px 0;
      padding: 4px;
      font-size: 14px;
      line-height: 16px;
      border: 1px solid #747474;
      border-radius: 4px;

      .layer-code {
        color: #888;
      }
    }
  }

  .dockerfile-container {
    width: 100%;
    height: 100%;
  }

  .row-container {
    width: 100%;

    .function-area {
      padding-right: 10px;
      border-right: 1px solid #ccc;

      .item-container {
        margin-bottom: 30px;

        .item-detail > div {
          margin: 5px 0;
          font-size: 14px;
          word-wrap: break-word;

          .key {
            color: #8d9199;
            font-weight: 500;
          }
        }

        .events-container {
          .event {
            margin-bottom: 15px;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;

            .event-item {
              width: 100%;
              margin-bottom: 20px;

              .event-type {
                font-weight: 500;
                font-size: 15px;

                .link {
                  color: @themeColor;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
