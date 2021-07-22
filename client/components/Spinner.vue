<template>
  <b-spinner small v-if="isVisible" label="Spinning"></b-spinner>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: {
    delay: {
      type: Number,
      default: 150,
    },
  },
  data: () => ({
    isVisible: false,
    timeout: 0,
  }),
  methods: {
    show() {
      if (!this.timeout) {
        this.timeout = setTimeout(() => {
          this.isVisible = true;
        }, this.delay) as unknown as number;
      }
    },
    hide() {
      clearTimeout(this.timeout);
      this.isVisible = false;
      this.timeout = 0;
    },
  },
});
</script>
