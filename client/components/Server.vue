<template>
  <div>
    <h2>Server</h2>
    <b-row align-v="stretch">
      <b-col md="6">
        <b-card
          header="Monitorovanie"
          header-text-variant="white"
          header-bg-variant="dark"
          class="h-100"
        >
          <b-table
            striped
            hover
            :items="stats.table"
            v-if="stats.loaded"
          ></b-table>
          <b-button variant="primary" @click="clearStats">
            Vynulovať
            <spinner ref="spinnerStats"></spinner>
          </b-button>
        </b-card>
      </b-col>
      <b-col md="6">
        <b-card
          header="Konfigurácia"
          header-text-variant="white"
          header-bg-variant="dark"
          class="h-100"
        >
          <b-form @submit="onSubmit" v-if="config.show">
            <b-form-group
              label="Počet front"
              label-for="number-of-queues"
              description="Parameter n zo zadania"
            >
              <b-form-input
                id="number-of-queues"
                v-model="config.current.numberOfQueues"
                type="number"
                min="1"
                max="1000"
                :disabled="formDisabled"
              ></b-form-input>
            </b-form-group>

            <b-form-group
              label="Kapacita fronty"
              label-for="queue-capacity"
              description="Parameter m zo zadania"
            >
              <b-form-input
                id="queue-capacity"
                v-model="config.current.queueCapacity"
                type="number"
                min="1"
                max="1000"
                :disabled="formDisabled"
              ></b-form-input>
            </b-form-group>

            <b-form-group
              label="Doba vybavenia požiadavky"
              label-for="mean-service-time"
              description="Parameter t zo zadania"
            >
              <b-form-input
                id="mean-service-time"
                v-model="config.current.meanServiceTime"
                type="number"
                min="0"
                max="10"
                step="0.1"
                :disabled="formDisabled"
              ></b-form-input>
            </b-form-group>

            <b-form-group
              label="Náhodnosť doby vybavenia požiadavky"
              label-for="service-time-deviation"
              description="Parameter r zo zadania"
            >
              <b-form-input
                id="service-time-deviation"
                v-model="config.current.serviceTimeDeviation"
                type="number"
                min="0"
                max="10"
                step="0.1"
                :disabled="formDisabled"
              ></b-form-input>
            </b-form-group>

            <b-button @click="onEdit" variant="primary" v-if="!config.edit"
              >Zmeniť</b-button
            >
            <b-button type="submit" variant="primary" v-if="config.edit"
              >Potvrdiť
              <spinner ref="spinnerConfig"></spinner>
            </b-button>
            <b-button variant="secondary" @click="onCancel" v-if="config.edit"
              >Zrušiť</b-button
            >
          </b-form>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Spinner from './Spinner.vue';
export default Vue.extend({
  components: { Spinner },
  props: {
    bus: Vue,
  },
  data() {
    return {
      stats: {
        loaded: false,
        table: [] as Object[],
      },
      config: {
        loaded: false,
        current: {
          numberOfQueues: 0,
          queueCapacity: 0,
          meanServiceTime: 0,
          serviceTimeDeviation: 0,
        },
        last: {
          numberOfQueues: 0,
          queueCapacity: 0,
          meanServiceTime: 0,
          serviceTimeDeviation: 0,
        },
        edit: false,
        show: false,
      },
    };
  },

  computed: {
    formDisabled() {
      return !(this as any).config.edit;
    },
  },

  activated() {
    console.log('ACTIVATED');
    this.loadStats();
    this.loadConfig();
    this.interval = setInterval(() => this.loadStats(), 1000);
  },

  deactivated() {
    console.log('DEACTIVATED');
    clearInterval(this.interval);
  },

  beforeDestroy() {
    clearInterval(this.interval);
  },

  methods: {
    async loadStats() {
      console.log('loadStats');
      const labels: { [index: string]: string } = {
        activeUsers: 'Aktuálmy počet užívateľov',
        numberOfQueues: 'Aktuálny počet front',
        queuedRequests: 'Počet čakajúcich požiadaviek',
        completedRequests: 'Počet vybavených požiadaviek',
        rejectedRequests: 'Počet zamietnutých požiadaviek',
        serviceUtilization: 'Priemerné využitie stredísk',
        avgWaitingTime: 'Priemerný čas čakania požiadaviek',
      };
      try {
        (this.$refs.spinnerStats as any).show();
        let stats = await this.$axios.$get('stats');

        stats.serviceUtilization =
          (stats.serviceUtilization * 100).toFixed(2) + '%';
        stats.avgWaitingTime = stats.avgWaitingTime.toFixed(2) + 's';

        this.stats.table = Object.keys(stats).map((key) => ({
          Parameter: labels[key] || key,
          Hodnota: stats[key],
        }));

        (this.$refs.spinnerStats as any).hide();
        this.stats.loaded = true;
      } catch (error) {
        (this.$refs.spinnerStats as any).hide();
        this.showError(error.message);
      }
    },

    async clearStats() {
      try {
        (this.$refs.spinnerStats as any).show();
        await this.$axios.$delete('stats');
        (this.$refs.spinnerStats as any).hide();
      } catch (error) {
        (this.$refs.spinnerStats as any).hide();
        this.showError(error.message);
      }
    },

    async loadConfig() {
      this.config.current = await this.$axios.$get('config');
      this.config.loaded = true;
      this.config.show = true;
    },

    async saveConfig() {
      try {
        (this.$refs.spinnerConfig as any).show();

        // problém je že pri editácii sa zmenia polia na string
        (this.config.current.numberOfQueues = sanitate(
          this.config.current.numberOfQueues
        )),
          (this.config.current.queueCapacity = sanitate(
            this.config.current.queueCapacity
          )),
          (this.config.current.meanServiceTime = sanitate(
            this.config.current.meanServiceTime
          )),
          (this.config.current.serviceTimeDeviation = sanitate(
            this.config.current.serviceTimeDeviation
          )),
          await this.$axios.$post('config', this.config.current);
        console.log('POSTED');
        (this.$refs.spinnerConfig as any).hide();
        this.config.edit = false;
      } catch (error) {
        (this.$refs.spinnerConfig as any).hide();
        this.showError(error.message);
      }
    },
    onEdit() {
      this.config.edit = true;
      this.config.last = Object.assign({}, this.config.current);
    },
    onSubmit(event: Event) {
      event.preventDefault();
      this.saveConfig();
    },
    onCancel(event: Event) {
      event.preventDefault();
      this.config.current = this.config.last;
      // Trick to reset/clear native browser form validation state
      this.config.edit = false;
      this.config.show = false;
      this.$nextTick(() => {
        this.config.show = true;
      });
    },
    showError(message: string) {
      this.$bvToast.toast(message, {
        title: 'Chyba',
        variant: 'danger',
      });
    },
  },
});

function sanitate(value: any): number {
  if (typeof value == 'string') {
    return parseFloat(value);
  }
  return value;
}
</script>
