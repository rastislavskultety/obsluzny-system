<template>
  <div>Hello {{ userName }}</div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: {
    userName: String,
  },
  data() {
    return {};
  },
});
</script>
