<template>
  <div>
    <h2>Simulácia klientských požiadaviek</h2>
    <b-container>
      <b-form @submit="onSubmit">
        <b-form-row>
          <b-form-group
            label="Počet užívateľov"
            label-for="number-of-users"
            class="mt-3 mr-3"
          >
            <b-form-input
              id="number-of-users"
              v-model="numberOfUsers"
              type="number"
              placeholder="Počet užívateľov"
              min="1"
              max="100"
              :disabled="simulationIsRunning"
            ></b-form-input>
          </b-form-group>

          <b-form-group
            label="Stredná doba medzi požiadavkami"
            label-for="mean-request-distance"
            class="mt-3 mr-3"
          >
            <b-form-input
              id="mean-request-distance"
              v-model="meanRequestTime"
              type="number"
              min="0"
              max="10"
              step="0.1"
              :disabled="simulationIsRunning"
            ></b-form-input>
          </b-form-group>

          <b-form-group
            label="Náhodnosť doby medzi požiadavkami"
            label-for="request-distance-deviation"
            class="mt-3"
          >
            <b-form-input
              id="request-distance-deviation"
              v-model="requestTimeDeviation"
              type="number"
              class="mb-2 mr-sm-2 mb-sm-0"
              min="0"
              max="10"
              step="0.1"
              :disabled="simulationIsRunning"
            ></b-form-input>
          </b-form-group>
        </b-form-row>
        <b-form-row>
          <b-form-group>
            <b-button
              type="submit"
              :variant="simulationIsRunning ? 'secondary' : 'primary'"
              :disabled="simulationIsRunning"
            >
              Štart
              <spinner ref="spinner"> </spinner>
            </b-button>

            <b-button
              :variant="simulationIsRunning ? 'primary' : 'secondary'"
              :disabled="!simulationIsRunning"
              @click="stop"
            >
              Stop
            </b-button>
          </b-form-group>
        </b-form-row>
      </b-form>
    </b-container>

    <hr />
    <h3>Log</h3>
    <b-form inline @submit="preventSubmit" class="mb-3">
      <b-form-group label="Zobrazené riadky" label-for="number-of-log-lines">
        <b-form-input
          id="number-of-log-lines"
          v-model="numberOfLogLinesInput"
          type="number"
          min="1"
          :max="maxNumberOfLogLines"
          class="mx-3"
        >
        </b-form-input>
      </b-form-group>
    </b-form>
    <log ref="log" :maxLines="numberOfLogLines"></log>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Log from './Log.vue';

export default Vue.extend({
  props: {
    bus: Vue,
  },

  components: {
    Log,
  },

  data: () => ({
    simulationIsRunning: false,
    numberOfUsers: 10,
    meanRequestTime: 1,
    requestTimeDeviation: 0.5,
    numberOfLogLinesInput: 10,
    numberOfLogLinesValidated: 10,
    maxNumberOfLogLines: 1000,
  }),

  computed: {
    numberOfLogLines() {
      let n = Number.parseInt(this.numberOfLogLinesInput as any);
      if (!isNaN(n) && n > 0 && n <= this.maxNumberOfLogLines) {
        this.numberOfLogLinesValidated = n;
      }
      return this.numberOfLogLinesValidated;
    },
  },

  mounted() {
    this.bus.$on('sim-status', (running: boolean) => {
      this.simulationIsRunning = running;
    });

    this.bus.$on('sim-log', (message: string) => {
      (this.$refs.log as any).add(message);
    });

    this.bus.$on('sim-error', (message: string) => {
      this.bus.$emit('showError', message);
    });
  },

  methods: {
    onSubmit(event: Event) {
      event.preventDefault();
      (this.$refs.log as any).clear();
      this.start();
    },

    start() {
      const params = {
        numberOfUsers: Number.parseInt(this.numberOfUsers as any),
        meanRequestTime: Number.parseFloat(this.meanRequestTime as any),
        requestTimeDeviation: Number.parseFloat(
          this.requestTimeDeviation as any
        ),
      };
      this.bus.$emit('sim-request-start', params);
    },

    stop() {
      this.bus.$emit('sim-request-stop');
    },

    preventSubmit(event: Event) {
      event.preventDefault();
    },
  },
});
</script>
