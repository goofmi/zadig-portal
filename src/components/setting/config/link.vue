<template>
  <div class="config-link">
    <el-alert type="info" :closable="false">
      <template>支持添加外部快捷链接，详情可参考
        <el-link style="font-size: 14px; vertical-align: baseline;"
          type="primary"
          :href="`https://docs.koderover.com/zadig/settings/system-settings/#快捷链接`"
          :underline="false"
          target="_blank">帮助文档</el-link>
      </template>
    </el-alert>
    <div class="link-content">
      <el-table :data="links" style="width: 100%;">
        <el-table-column prop="name" label="名称">
          <template slot-scope="{row}">
            <span v-show="!row.edit">{{row.name}}</span>
            <el-input v-show="row.edit" v-model="row.name" placeholder="请输入名称" size="small"></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="url" label="URL">
          <template slot-scope="{row}">
            <span v-show="!row.edit">{{row.url}}</span>
            <el-input v-show="row.edit" v-model="row.url" placeholder="请输入 URL" size="small"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="{row}">
            <el-button v-if="!row.edit" size="mini" type="primary" @click="row.edit = true" plain>编辑</el-button>
            <el-button v-if="!row.edit" size="mini" type="danger"  @click="deleteExternalLink(row)" plain>删除</el-button>
            <el-button v-if="row.edit"  size="mini" type="primary" @click="updateExternalLink(row)" plain>确认</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 20px;">
        <el-button type="text" icon="el-icon-plus" @click="addLink">添加</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getExternalLinksAPI,
  createExternalLinkAPI,
  updateExternalLinkAPI,
  deleteExternalLinkAPI
} from '@api'
export default {
  data () {
    return {
      links: []
    }
  },
  methods: {
    addLink () {
      this.links.push({
        id: '',
        name: '',
        url: '',
        edit: true
      })
    },
    getExternalLinks () {
      getExternalLinksAPI().then(res => {
        this.$store.commit('SET_EXTERNAL_LINK', res || [])
        this.links = (res || []).map(re => {
          return {
            ...re,
            edit: false
          }
        })
      })
    },

    updateExternalLink (data) {
      if (!data.name || !data.url) {
        this.$message.info(`${data.name ? 'URL ' : '名称'}不能为空！`)
        return
      }
      const payload = {
        name: data.name,
        url: data.url
      }
      const res = data.id
        ? updateExternalLinkAPI(data.id, payload)
        : createExternalLinkAPI(payload)
      res.then(() => {
        this.$message.success(`${data.id ? '更新' : '新建'}外部链接成功！`)
        this.getExternalLinks()
      })
    },
    deleteExternalLink (data) {
      deleteExternalLinkAPI(data.id).then(() => {
        this.$message.success(`删除外部链接成功！`)
        this.getExternalLinks()
      })
    }
  },
  created () {
    this.getExternalLinks()
  }
}
</script>

<style lang="less" scoped>
.config-link {
  .link-content {
    padding-top: 15px;
    padding-bottom: 15px;
  }
}
</style>
