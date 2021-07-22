<template>
  <div>
    <spinner ref="spinner"></spinner>
    <register v-if="!loading && !username" :bus="bus"></register>
    <request v-if="username" :bus="bus"></request>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { getCurrentUser } from './lib/rest-api';
import Spinner from './Spinner.vue';

export default Vue.extend({
  components: { Spinner },
  props: {
    bus: Vue,
  },

  data() {
    return {
      username: '',
      loading: true,
    };
  },

  async mounted() {
    this.loading = true;
    (this.$refs.spinner as any).show();
    this.username = await getCurrentUser(this.$axios);
    this.loading = false;
    (this.$refs['spinner'] as any).hide();
    this.bus.$on('user', (username: string) => (this.username = username));
  },
});
</script>
