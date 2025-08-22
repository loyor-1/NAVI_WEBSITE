<script setup>

</script>

<template>
  <div class="app-page">
    <img class="app-bg" src="@/assets/img/app_bg.png" alt="">
    <router-view/>
  </div>
</template>

<style scoped lang="scss">
.app-page {
  width: 100vw;
  height: 100vh;
  .app-bg {
    z-index: -999;
    position: fixed;
    width: 100vw;
    height: 100vh;
  }
}
</style>
