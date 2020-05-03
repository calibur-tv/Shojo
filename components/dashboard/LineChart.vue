<template>
  <el-row
    v-if="resource.length"
    style="background:#fff;padding:16px 16px 0;margin-bottom:32px;"
  >
    <el-col
      :span="10"
      :offset="1"
    >
      <ve-line
        v-for="(key, index) in types"
        :key="index"
        :data="computeData(key)"
        :settings="computeSetting(key)"
      />
    </el-col>
    <el-col
      :span="10"
      :offset="1"
    >
      <ve-line
        v-for="(key, index) in types"
        :key="index"
        :data="computeAriseData(key)"
        :settings="computeAriseSetting(key)"
      />
    </el-col>
  </el-row>
</template>

<script>
export default {
  data() {
    return {
      loading: true,
      resource: [],
      keyMaps: {
        create_bangumi: '创建番剧',
        create_image: '总图片数',
        create_image_album: '总相册数',
        create_post: '总发帖',
        create_post_image: '总帖图数',
        create_post_reply: '总回帖量',
        create_comment: '发评论',
        create_role: '角色总数',
        create_video: '视频总量',
        user_register: '用户总量'
      },
      ariseKeyMaps: {
        create_bangumi: '番剧增长率',
        create_image: '图片增长率',
        create_image_album: '相册增长率',
        create_post: '帖子增长率',
        create_post_image: '帖图增长率',
        create_post_reply: '回帖增长率',
        create_comment: '评论增长率',
        create_role: '角色增长率',
        create_video: '视频增长率',
        user_register: '用户增长率'
      }
    }
  },
  computed: {
    groupByTypeData() {
      return _.mapValues(_.groupBy(this.resource, 'type'), clist =>
        clist.map(item => _.omit(item, 'type'))
      )
    },
    types() {
      return Object.keys(this.groupByTypeData)
    }
  },
  created() {
    // this.getData()
  },
  methods: {
    getData() {
      this.$axios
        .$get('admin/stats/timeline', {
          params: { days: 30 }
        })
        .then((data) => {
          this.resource = data.map((_) => {
            const day = parseInt(_.day, 10) * 1000
            return {
              id: parseInt(_.id, 10),
              day: parseInt(_.day, 10) * 1000,
              time: this.$moment(day).format('MM月DD日'),
              count: parseInt(_.count, 10),
              type: _.type
            }
          })
          this.loading = false
        })
    },
    computeData(key) {
      const data = this.groupByTypeData[key]
      return {
        rows: _.sortBy(data.map(_ => _), 'day', 'asc')
      }
    },
    computeAriseData(key) {
      const data = _.sortBy(this.groupByTypeData[key], 'day', 'asc')
      const result = data.map((item, index) => {
        if (!index) {
          return Object.assign({}, item, {
            count: 0
          })
        }
        const lastVal = data[index - 1].count
        return Object.assign({}, item, {
          count: parseFloat((item.count - lastVal) / lastVal)
        })
      })
      return {
        rows: result
      }
    },
    computeSetting(key) {
      return {
        metrics: ['count'],
        dimension: ['time'],
        labelMap: {
          count: this.keyMaps[key]
        }
      }
    },
    computeAriseSetting(key) {
      return {
        metrics: ['count'],
        dimension: ['time'],
        yAxisType: ['percent'],
        digit: 2,
        labelMap: {
          count: this.ariseKeyMaps[key]
        }
      }
    }
  }
}
</script>
