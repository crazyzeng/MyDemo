<template>
  <div class="home">
    <!-- <img alt="Vue logo" src="../assets/logo.png"> -->
    <HelloWorld msg="Welcome to Your Vue.js App"/>
    <div>
      <el-button type="primary" @click="post()">主要按钮</el-button>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  data () {
    return {

    }
  },
  mounted: function () {

  },
  methods: {
    post () {
      this.$postJSON('/exam/login', { userName: '1', passWord: '1' })
        .then(data => {})
    }
  },
  name: 'home',
  components: {
    HelloWorld
  }
}
</script>
