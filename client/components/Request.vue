<template>
  <div>
    <h2>Užívateľské požiadavky</h2>
    <p>
      Systém implementuje službu ktorá zobrazuje náhodne vybrané citáty v
      angličtine z databázy. Môžete na jednu požiadavku získať od 1 do 100
      citátov naraz.
    </p>

    <div class="mb-5">
      <b-form inline @submit="onSubmit">
        <b-form-group label="Počet citátov">
          <b-form-input
            id="number-of-quotes"
            v-model="numberOfQuotes"
            type="number"
            class="mr-1"
            required
            min="1"
            max="100"
          ></b-form-input>

          <b-button type="submit" variant="primary" :disabled="pendingRequest">
            Požiadavka
            <spinner ref="spinner"> </spinner>
          </b-button>

          <b-button @click="clear"> Vymazať výstup </b-button>
        </b-form-group>
      </b-form>

      <b-alert variant="danger" :show="!!errorMessage" class="my-3">
        {{ errorMessage }}
      </b-alert>
    </div>
    <!-- <b-card-group rows> -->

    <b-card
      v-for="res in responses"
      v-bind:key="res.id"
      :title="`Požiadavka ${res.id}`"
      class="mb-3"
    >
      <hr />
      <div class="process-info">
        Požiadavku spracovalo servisné centrum #{{ res.serviceCenter }} za
        {{ res.duration }}s.
      </div>

      <b-card-text v-for="quote in res.quotes" v-bind:key="quote.id">
        <blockquote class="blockquote mb-0">
          <p>
            {{ quote.quote }}
          </p>
          <footer class="blockquote-footer">{{ quote.author }}</footer>
        </blockquote>
      </b-card-text>
    </b-card>
    <!-- </b-card-group> -->
  </div>
</template>

<style scoped>
blockquote {
  font-family: Georgia, serif;
  font-size: 18px;
  font-style: italic;
  margin: 0.25em 0;
  padding: 0.35em 40px;
  line-height: 1.45;
  position: relative;
  color: #383838;
}

blockquote:before {
  display: block;
  padding-left: 10px;
  content: '\201C';
  font-size: 80px;
  position: absolute;
  left: -20px;
  top: -20px;
  color: #7a7a7a;
}

blockquote cite {
  color: #999999;
  font-size: 14px;
  display: block;
  margin-top: 5px;
}

blockquote cite:before {
  content: '\2014 \2009';
}

.process-info {
  font-size: 8px;
  color: #999999;
  text-align: right;
  margin-top: -14px;
}
</style>
<script lang="ts">
import Vue from 'vue';
import * as RestApi from './lib/rest-api';
import Spinner from './Spinner.vue';

interface Response {
  id: number;
  quotes: {
    [index: number]: { id: number; quote: string };
  };
  serviceCenter: number;
  duration: string;
}

export default Vue.extend({
  components: { Spinner },
  data: () => ({
    responses: [] as Response[],
    lastId: 0,
    numberOfQuotes: 1,
    errorMessage: '',
    pendingRequest: false,
  }),

  methods: {
    async onSubmit(event: Event) {
      event.preventDefault();
      try {
        this.errorMessage = '';
        let startTime = Date.now();

        (this.$refs.spinner as any).show();
        this.pendingRequest = true;

        let r = await this.$axios.get('quotes', {
          params: { count: this.numberOfQuotes },
        });
        let response = r.data;

        this.pendingRequest = false;
        (this.$refs.spinner as any).hide();

        this.lastId += 1;
        this.responses.unshift({
          id: this.lastId,
          quotes: response.quotes.map((item: RestApi.Quote, index: number) => ({
            id: index,
            quote: item.quote,
            author: item.author,
          })),
          serviceCenter: response.serviceCenter,
          duration: ((Date.now() - startTime) / 1000).toFixed(2),
        });
      } catch (err) {
        let msg = err.message;
        if (msg.match(/status code 503/)) {
          msg = 'Servisné fronty sú plné, skúste neskôr.';
        }
        this.errorMessage = msg;
        this.pendingRequest = false;
        (this.$refs.spinner as any).hide();
      }
    },

    clear() {
      this.responses = [];
      this.errorMessage = '';
    },
  },
});
</script>
