<template>
  <div id="dashboard">
    <panel-group />
    <line-chart />
  </div>
</template>

<script>
import PanelGroup from '~/components/dashboard/PanelGroup'
import LineChart from '~/components/dashboard/LineChart'

export default {
  components: {
    PanelGroup,
    LineChart
  }
}
</script>
