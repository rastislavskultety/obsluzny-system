<template>
  <footer class="fixed-bottom bg-primary" v-if="running">
    <b-container class="my-1">
      <b-form inline>
        <label class="mr-3 text-white">Simulácia je spustená</label>
        <b-button variant="light" @click="stop">Stop</b-button>
      </b-form>
    </b-container>
  </footer>
</template>

<script lang="ts">
import Vue from 'vue';
import { NuxtSocket } from 'nuxt-socket-io';

export interface SimParams {
  numberOfUsers: number;
  meanRequestTime: number;
  requestTimeDeviation: number;
}

export default Vue.extend({
  props: {
    bus: Vue,
  },

  data: () => ({
    running: false,
    socket: null as any as NuxtSocket,
  }),

  watch: {},

  mounted() {
    this.socket = this.$nuxtSocket({ name: 'main' });

    /* Listen for events: */
    this.socket.on('status', (isRunning: boolean) => {
      this.bus.$emit('sim-status', isRunning);
      this.running = isRunning;
    });

    this.socket.on('log', (message: string) => {
      this.bus.$emit('sim-log', message);
    });

    this.socket.on('error', (message: string) => {
      this.bus.$emit('sim-error', message);
    });

    this.bus.$on('sim-request-start', (params: SimParams) =>
      this.socket.emit('start', params)
    );

    this.bus.$on('sim-request-stop', () => this.stop());
  },

  methods: {
    stop() {
      this.socket.emit('stop');
    },
  },
});
</script>
