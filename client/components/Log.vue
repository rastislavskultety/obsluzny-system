<template>
  <b-card>
    <pre>{{ lines.join('\n') }}</pre>
  </b-card>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  props: {
    maxLines: {
      type: Number,
      default: 5,
    },
  },

  data: () => ({
    lines: [] as string[],
  }),

  computed: {
    content() {
      this.lines.join('\n');
    },
  },

  watch: {
    maxLines() {
      if (this.lines.length > this.maxLines) {
        this.lines.splice(0, this.lines.length - this.maxLines);
      }
    },
  },

  methods: {
    add(text: string) {
      if (this.lines.length >= this.maxLines) {
        this.lines.splice(0, this.lines.length - this.maxLines + 1);
      }
      this.lines.push(text);
    },

    clear() {
      this.lines = [];
    },
  },
});
</script>
