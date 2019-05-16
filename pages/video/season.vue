<template>
  <div
    id="video-season"
    v-loading="pageLoading"
  >
    <div class="page-header">
      <el-form
        :inline="true"
        :model="formInline"
      >
        <el-form-item label="是否下架">
          <el-select v-model="formInline.other_site">
            <el-option
              v-for="option in otherSiteOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="版权种类">
          <el-select
            v-model="formInline.copyright_type"
            @change="showCopyrightProvider = false"
          >
            <el-option
              v-for="option in queryCopyrightOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="连载周期">
          <el-select v-model="formInline.released_at">
            <el-option
              v-for="option in releaseOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="getData"
          >
            查询
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table
      :data="pageData"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="番剧">
        <template slot-scope="scope">
          <a
            :href="$alias.bangumi(scope.row.bangumi.id)"
            target="_blank"
            v-text="scope.row.bangumi.name"
          />
        </template>
      </el-table-column>
      <el-table-column label="季度">
        <template slot-scope="scope">
          <span>
            {{ scope.row.name ? scope.row.name : `第${scope.row.rank}季` }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="版权">
        <template slot-scope="scope">
          <el-select
            v-model="scope.row.copyright_type"
            @change="changeCopyright(scope.row, 'copyright_type')"
          >
            <el-option
              v-for="item in selectCopyrightOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              :disabled="item.value === -1"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column
        v-if="formInline.copyright_type === 2 && showCopyrightProvider"
        label="版权方"
      >
        <template slot-scope="scope">
          <el-select
            v-model="scope.row.copyright_provider"
            @change="changeCopyright(scope.row, 'copyright_provider')"
          >
            <el-option
              v-for="item in copyrightProvider"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              :disabled="item.value === -1"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="下架">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.other_site_video"
            :disabled="true"
            active-text="已下架"
            inactive-text="可播放"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <a
            :href="`/bangumi/edit/?id=${scope.row.bangumi_id}`"
            target="_blank"
          >
            <el-button
              size="small"
              type="primary"
            >查看</el-button>
          </a>
          <el-button
            :type="scope.row.other_site_video ? 'success' : 'danger'"
            size="small"
            @click="setResource(scope.row)"
          >
            {{ scope.row.other_site_video ? '上架' : '下架' }}
          </el-button>
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
const copyright = [
  '未知',
  '责令下架',
  '独家播放',
  '多家全收费',
  '多家个别收费',
  '多家全免费',
  '广电禁播',
  '无版权'
]
const copyrightOptions = []
copyright.forEach((item, index) => {
  copyrightOptions.push({
    label: item,
    value: index
  })
})

export default {
  name: 'VideoSeason',
  mixins: [pageMixin],
  data() {
    return {
      copyright,
      copyrightOptions,
      copyrightProvider: [
        {
          label: '修改未保存',
          value: -1
        },
        {
          label: '未知',
          value: 0
        },
        {
          label: 'bilibili',
          value: 1
        },
        {
          label: 'acfun',
          value: 2
        },
        {
          label: '爱奇艺',
          value: 3
        },
        {
          label: '优酷/土豆',
          value: 4
        },
        {
          label: '芒果TV',
          value: 5
        },
        {
          label: '乐视',
          value: 6
        },
        {
          label: '搜狐',
          value: 7
        },
        {
          label: 'PPTV',
          value: 8
        },
        {
          label: '腾讯',
          value: 9
        }
      ],
      showCopyrightProvider: false,
      formInline: {
        copyright_type: '',
        other_site: '',
        released_at: ''
      },
      otherSiteOptions: [
        {
          label: '未筛选',
          value: ''
        },
        {
          label: '未下架',
          value: 0
        },
        {
          label: '已下架',
          value: 1
        }
      ],
      releaseOptions: [
        {
          value: '',
          label: '未筛选'
        },
        {
          value: 0,
          label: '不连载'
        },
        {
          value: 1,
          label: '周一'
        },
        {
          value: 2,
          label: '周二'
        },
        {
          value: 3,
          label: '周三'
        },
        {
          value: 4,
          label: '周四'
        },
        {
          value: 5,
          label: '周五'
        },
        {
          value: 6,
          label: '周六'
        },
        {
          value: 7,
          label: '周日'
        }
      ]
    }
  },
  computed: {
    selectCopyrightOptions() {
      return [{ label: '修改未保存', value: -1 }].concat(copyrightOptions)
    },
    queryCopyrightOptions() {
      return [{ label: '未筛选', value: '' }].concat(copyrightOptions)
    }
  },
  created() {
    this.getData()
  },
  methods: {
    getData() {
      this.pageLoading = true
      this.$axios
        .$get('admin/season/search_all', {
          params: this.formInline
        })
        .then(data => {
          this.pageState.cur = 1
          this.pageState.size = 50
          this.pageState.total = data.length
          this.pageList = data
          this.pageLoading = false
          this.showCopyrightProvider = true
        })
        .catch(() => {
          this.pageLoading = false
        })
    },
    setResource(season) {
      if (this.canNot('创建编辑番剧')) {
        return
      }
      this.$confirm('确定要执行该操作吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$axios
            .$post('admin/season/update_key', {
              season_id: season.id,
              bangumi_id: season.bangumi_id,
              key: 'other_site_video',
              val: !season.other_site_video
            })
            .then(() => {
              season.other_site_video = !season.other_site_video
            })
        })
        .catch(() => {})
    },
    changeCopyright(season, key) {
      if (this.canNot('创建编辑番剧')) {
        return
      }
      this.$confirm('是否要保存更改?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$axios.$post('admin/season/update_key', {
            season_id: season.id,
            bangumi_id: season.bangumi_id,
            key,
            val: season[key]
          })
        })
        .catch(() => {
          season[key] = -1
        })
    }
  }
}
</script>
