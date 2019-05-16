<template>
  <div
    v-loading="pageLoading"
    id="user-faker"
  >
    <header class="page-header">
      <el-button
        type="primary"
        @click="createNewFakerUser"
      >
        <i class="el-icon-plus"/>
        创建运营号
      </el-button>
    </header>
    <el-table
      :data="pageData"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="用户">
        <a
          slot-scope="scope"
          :href="$alias.user(scope.row.zone)"
          target="_blank"
          v-text="scope.row.nickname"
        />
      </el-table-column>
      <el-table-column
        prop="phone"
        label="账号"
      />
      <el-table-column
        prop="coin_count"
        label="团子"
      />
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            type="danger"
            @click="newLife(scope.$index, scope.row)"
          >账号认领</el-button>
        </template>
      </el-table-column>
    </el-table>
    <v-page
      :state="pageState"
      :change="handlePageChange"
    />
  </div>
</template>

<script>
import pageMixin from '~/mixins/page'

export default {
  name: 'UserFaker',
  mixins: [pageMixin],
  created() {
    this.getData()
  },
  methods: {
    async getData() {
      this.pageLoading = true
      this.$axios
        .$get('admin/user/faker/list')
        .then(data => {
          this.pageState.cur = 1
          this.pageState.size = 20
          this.pageState.total = data.length
          this.pageList = data
          this.pageLoading = false
        })
        .catch(() => {
          this.pageLoading = false
        })
    },
    newLife(index, user) {
      if (this.canNot('操作运营号')) {
        return
      }
      this.$prompt('请输入转让者的手机号', '提示', {
        confirmButtonText: '提交',
        cancelButtonText: '取消',
        inputPattern: /^(0|86|17951)?(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}$/,
        inputErrorMessage: '手机格式不正确'
      })
        .then(({ value }) => {
          this.$axios
            .$post('admin/user/faker/reborn', {
              id: user.id,
              phone: value
            })
            .then(() => {
              this.pageList.splice(
                (this.pageState.cur - 1) * this.pageState.size + index,
                1
              )
              this.pageState.total--
            })
        })
        .catch(() => {})
    },
    createNewFakerUser() {
      if (this.canNot('操作运营号')) {
        return
      }
      this.$prompt('请输入要创建的用户昵称', '提示', {
        confirmButtonText: '提交',
        cancelButtonText: '取消'
      })
        .then(({ value }) => {
          const length = value.replace(/([\u4e00-\u9fa5])/g, 'aa').trim().length
          if (length > 14 || length < 2) {
            this.$toast.error('名字长度不符')
            return
          }
          let isOld = false
          this.pageList.forEach(faker => {
            if (faker.nickname.indexOf(value) !== -1) {
              isOld = true
            }
          })
          if (isOld) {
            this.$toast.error('名字重复了')
            return
          }
          this.$axios
            .$post('admin/user/faker/create', {
              nickname: value,
              phone: Date.now()
                .toString()
                .slice(0, -2)
            })
            .then(data => {
              this.pageList.unshift(data)
              this.pageState.total++
            })
        })
        .catch(() => {})
    }
  }
}
</script>
