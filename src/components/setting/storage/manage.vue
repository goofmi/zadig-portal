<template>
  <div v-loading="loading"
       element-loading-text="加载中..."
       element-loading-spinner="iconfont iconfont-loading iconduixiangcunchu"
       class="setting-storage-container">
    <!--storage-create-dialog-->
    <el-dialog title='添加'
               :visible.sync="dialogStorageCreateFormVisible"
               custom-class="dialog-style"
               :close-on-click-modal="false"
               width="35%">
      <el-form ref="storage"
               :rules="rules"
               label-width="120px"
               label-position="left"
               :model="storage">
        <el-form-item label="提供商"
                      prop="provider">
          <el-select v-model="storage.provider"
                     style="width: 100%;"
                     size="small"
                     placeholder="请选择对象存储提供商">
            <el-option :value="1"
                       label="阿里云 OSS">
              <i class="iconfont iconaliyun"></i> <span>阿里云 OSS</span>
            </el-option>

            <el-option :value="2"
                       label="腾讯云 COS">
              <i class="iconfont icontengxunyun"></i> <span>腾讯云 COS</span>
            </el-option>
            <el-option :value="3"
                       label="七牛云 Kodo">
              <i class="iconfont iconqiniu"></i> <span>七牛云 Kodo</span>
            </el-option>
            <el-option :value="4"
                       label="华为云 OBS">
              <i class="iconfont iconhuawei"></i> <span>华为云 OBS</span>
            </el-option>
            <el-option :value="0"
                       label="其他">
              <i class="iconfont iconqita"></i> <span>其他</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="接入点地址"
                      prop="endpoint">
          <el-input size="small"
                    v-model="storage.endpoint"
                    placeholder="请输入接入点地址"></el-input>
        </el-form-item>
        <el-form-item label="AK"
                      prop="ak">
          <el-input size="small"
                    v-model="storage.ak"
                    placeholder="请输入 Access Key"></el-input>
        </el-form-item>
        <el-form-item label="SK"
                      prop="sk">
          <el-input size="small"
                    show-password
                    v-if="dialogStorageCreateFormVisible"
                    type="password"
                    v-model="storage.sk"
                    placeholder="请输入 Secret Key"></el-input>
        </el-form-item>
        <el-form-item label="Bucket"
                      prop="bucket">
          <el-input size="small"
                    v-model="storage.bucket"
                    placeholder="请输入 Bucket"></el-input>
        </el-form-item>
        <el-form-item label="存储相对路径"
                      prop="subfolder">
          <el-input size="small"
                    v-model="storage.subfolder"
                    placeholder="请输入存储相对路径"></el-input>
        </el-form-item>
        <el-form-item label="协议"
                      prop="insecure">
          <el-radio v-model="storage.insecure"
                    :label="true">HTTP</el-radio>
          <el-radio v-model="storage.insecure"
                    :label="false">HTTPS</el-radio>
        </el-form-item>
        <el-form-item label="默认使用"
                      prop="is_default">
          <el-checkbox size="small"
                       v-model="storage.is_default"></el-checkbox>
        </el-form-item>
      </el-form>
      <div slot="footer"
           class="dialog-footer">
        <el-button size="small"
                   @click="dialogStorageCreateFormVisible = false">取 消</el-button>
        <el-button size="small"
                   :plain="true"
                   type="success"
                   @click="storageOperation('add')">保存</el-button>
      </div>
    </el-dialog>
    <!--storage-create-dialog-->

    <!--storage-edit-dialog-->
    <el-dialog title='修改'
               :visible.sync="dialogStorageEditFormVisible"
               custom-class="dialog-style"
               :close-on-click-modal="false"
               width="35%">
      <el-form ref="swapStorage"
               :rules="rules"
               label-width="120px"
               label-position="left"
               :model="swapStorage">
        <el-form-item label="提供商"
                      prop="provider">
          <el-select v-model="swapStorage.provider"
                     style="width: 100%;"
                     size="small"
                     placeholder="请选择对象存储提供商">
            <el-option :value="1"
                       label="阿里云 OSS">
              <i class="iconfont iconaliyun"></i> <span>阿里云 OSS</span>
            </el-option>

            <el-option :value="2"
                       label="腾讯云 COS">
              <i class="iconfont icontengxunyun"></i> <span>腾讯云 COS</span>
            </el-option>
            <el-option :value="3"
                       label="七牛云 Kodo">
              <i class="iconfont iconqiniu"></i> <span>七牛云 Kodo</span>
            </el-option>
            <el-option :value="4"
                       label="华为云 OBS">
              <i class="iconfont iconhuawei"></i> <span>华为云 OBS</span>
            </el-option>
            <el-option :value="0"
                       label="其他">
              <i class="iconfont iconqita"></i> <span>其他</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="接入点地址"
                      prop="endpoint">
          <el-input size="small"
                    v-model="swapStorage.endpoint"
                    placeholder="请输入接入点地址"></el-input>
        </el-form-item>
        <el-form-item label="AK"
                      prop="ak">
          <el-input size="small"
                    v-model="swapStorage.ak"
                    placeholder="请输入 Access Key"></el-input>
        </el-form-item>
        <el-form-item label="SK"
                      prop="sk">
          <el-input size="small"
                    v-model="swapStorage.sk"
                    type="passsword"
                    show-password
                    v-if="dialogStorageEditFormVisible"
                    placeholder="请输入 Secret Key"></el-input>
        </el-form-item>
        <el-form-item label="Bucket"
                      prop="bucket">
          <el-input size="small"
                    v-model="swapStorage.bucket"
                    placeholder="请输入 Bucket"></el-input>
        </el-form-item>
        <el-form-item label="存储相对路径"
                      prop="subfolder">
          <el-input size="small"
                    v-model="swapStorage.subfolder"
                    placeholder="请输入存储相对路径"></el-input>
        </el-form-item>
        <el-form-item label="协议"
                      prop="insecure">
          <el-radio v-model="swapStorage.insecure"
                    :label="true">HTTP</el-radio>
          <el-radio v-model="swapStorage.insecure"
                    :label="false">HTTPS</el-radio>
        </el-form-item>
        <el-form-item label="默认使用"
                      prop="is_default">
          <el-checkbox size="small"
                       v-model="swapStorage.is_default"></el-checkbox>
        </el-form-item>
      </el-form>
      <div slot="footer"
           class="dialog-footer">
        <el-button size="small"
                   @click="dialogStorageEditFormVisible = false">取 消</el-button>
        <el-button size="small"
                   :plain="true"
                   type="success"
                   @click="storageOperation('update')">保存</el-button>
      </div>
    </el-dialog>
    <!--storage-edit-dialog-->
    <div class="section">
      <el-alert type="info"
                :closable="false">
        <template>
          支持集成阿里云 OSS、腾讯云 COS、华为云 OBS、七牛云 KODO 等符合 Amazon S3(Amazon Simple Storage Service) 协议的对象存储，详情可参考
          <el-link style="font-size: 14px; vertical-align: baseline;"
                   type="primary"
                   :href="`https://docs.koderover.com/zadig/settings/object-storage/`"
                   :underline="false"
                   target="_blank">帮助文档</el-link>
        </template>
      </el-alert>
      <div class="sync-container">
        <el-button :plain="true"
                   size="small"
                   @click="dialogStorageCreateFormVisible=true"
                   type="success">新建</el-button>
      </div>
      <div class="storage-list">
        <template>
          <el-table :data="allStorage"
                    style="width: 100%;">
            <el-table-column label="提供商/接入点地址">
              <template slot-scope="scope">
                <i :class="getProviderMap(scope.row.provider,'icon')"></i>
                <span>{{scope.row.endpoint}}</span>
              </template>
            </el-table-column>
            <el-table-column label="Bucket">
              <template slot-scope="scope">
                <span>{{scope.row.bucket}}</span>
              </template>
            </el-table-column>
            <el-table-column label="相对路径">
              <template slot-scope="scope">
                <span v-if="scope.row.subfolder">{{scope.row.subfolder}}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column width="80"
                             label="HTTPS">
              <template slot-scope="scope">
                <span>{{!scope.row.insecure?'是':'否'}}</span>
              </template>
            </el-table-column>

            <el-table-column width="100"
                             label="默认使用">
              <template slot-scope="scope">
                <el-tag size="small"
                        v-if="scope.row.is_default">默认使用</el-tag>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column width="220px"
                             label="修改时间">
              <template slot-scope="scope">
                <i class="el-icon-time"></i>
                <span>{{ $utils.convertTimestamp(scope.row.update_time) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="最后修改">
              <template slot-scope="scope">
                <span>{{ scope.row.updated_by}}</span>
              </template>
            </el-table-column>

            <el-table-column width="180px"
                             label="操作">
              <template slot-scope="scope">
                <el-button @click="storageOperation('edit',scope.row)"
                           size="mini"
                           type="primary"
                           plain>编辑</el-button>
                <el-button @click="storageOperation('delete',scope.row)"
                           size="mini"
                           type="danger"
                           plain>删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </div>
    </div>

  </div>
</template>

<script>

import { getStorageListAPI, createStorageAPI, updateStorageAPI, deleteStorageAPI } from '@api'
import bus from '@utils/eventBus'
export default {
  data () {
    return {
      allStorage: [],
      storage: {
        provider: null,
        ak: '',
        sk: '',
        endpoint: '',
        bucket: '',
        subfolder: '',
        insecure: true,
        is_default: true
      },
      swapStorage: {
        provider: null,
        ak: '',
        sk: '',
        endpoint: '',
        bucket: '',
        subfolder: '',
        insecure: true,
        is_default: true
      },
      providerMap: {
        0: {
          icon: 'iconfont logo iconqita',
          name: '其他'
        },

        1: {
          icon: 'iconfont logo iconaliyun ',
          name: '阿里云 OSS'
        },
        2: {
          icon: 'iconfont logo icontengxunyun',
          name: '腾讯云 COS'
        },
        3: {
          icon: 'iconfont logo iconqiniu',
          name: '七牛云 Kodo'
        },
        4: {
          icon: 'iconfont logo iconhuawei',
          name: '华为云 OBS'
        }
      },
      dialogStorageCreateFormVisible: false,
      dialogStorageEditFormVisible: false,
      loading: true,
      rules: {
        provider: [{ required: true, message: '请选择提供商', trigger: 'blur' }],
        ak: [{ required: true, message: '请输入 Access Key', trigger: 'blur' }],
        sk: [{ required: true, message: '请输入 Secret Key', trigger: 'blur' }],
        endpoint: [{
          required: true,
          message: '请输入接入点地址',
          trigger: 'blur'
        }],
        bucket: [{ required: true, message: '请输入 Bucket', trigger: 'blur' }]
      }
    }
  },
  methods: {
    getProviderMap (name, type) {
      if (name && type) {
        return this.providerMap[name][type]
      } else {
        return this.providerMap[0].icon
      }
    },
    storageOperation (operate, current_storage) {
      if (operate === 'add') {
        this.$refs.storage.validate(valid => {
          if (valid) {
            const payload = this.storage
            this.dialogStorageCreateFormVisible = false
            this.addStorage(payload)
          } else {
            return false
          }
        })
      } else if (operate === 'edit') {
        this.swapStorage = this.$utils.cloneObj(current_storage)
        this.dialogStorageEditFormVisible = true
      } else if (operate === 'update') {
        this.$refs.swapStorage.validate(valid => {
          if (valid) {
            const id = this.swapStorage.id
            const payload = this.swapStorage
            this.dialogStorageEditFormVisible = false
            this.updateStorage(id, payload)
          } else {
            return false
          }
        })
      } else if (operate === 'delete') {
        const id = current_storage.id
        this.$confirm(`确定要删除 ${current_storage.endpoint} ?`, '确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(({ value }) => {
          deleteStorageAPI(id).then((res) => {
            this.getStorage()
            this.$message({
              message: '删除成功',
              type: 'success'
            })
          })
        })
      }
    },
    addStorage (payload) {
      createStorageAPI(payload).then((res) => {
        this.$refs.storage.resetFields()
        this.getStorage()
        this.storage = {
          ak: '',
          sk: '',
          endpoint: '',
          bucket: '',
          subfolder: '',
          insecure: true,
          is_default: true
        }
        this.$message({
          type: 'success',
          message: '新增成功'
        })
      })
    },
    updateStorage (id, payload) {
      updateStorageAPI(id, payload).then((res) => {
        this.$refs.swapStorage.resetFields()
        this.getStorage()
        this.$message({
          type: 'success',
          message: '更新成功'
        })
      })
    },
    getStorage () {
      this.loading = true
      const key = this.$utils.rsaEncrypt()
      getStorageListAPI(key).then((res) => {
        this.loading = false
        res.forEach(item => {
          item.sk = this.$utils.aesDecrypt(item.sk)
        })
        this.allStorage = res
      })
    }
  },
  computed: {

  },
  created () {
    bus.$emit('set-topbar-title', { title: '对象存储', breadcrumb: [] })

    this.getStorage()
  }
}
</script>

<style lang="less">
.setting-storage-container {
  position: relative;
  flex: 1;
  padding: 15px 30px;
  overflow: auto;
  font-size: 13px;

  .section {
    margin-bottom: 56px;

    .sync-container {
      padding-top: 15px;
      padding-bottom: 15px;
      overflow: hidden;

      .el-button--success.is-plain {
        color: @themeColor;
        background: #fff;
        border-color: @themeColor;
      }

      .el-button--success.is-plain:hover {
        color: @themeColor;
        background: #fff;
        border-color: @themeColor;
      }
    }

    .storage-list {
      padding-bottom: 30px;

      .logo {
        font-size: 20px;
      }
    }
  }

  .dialog-style {
    .el-dialog__body {
      padding: 0 20px;
    }
  }
}
</style>
