<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
import {writeFile} from 'fs'
console.log("writeFile", writeFile)
export default {
  name: 'App'
}
</script>
