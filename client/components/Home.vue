<template>
  <div class="mt-5">
    <b-card-group deck>
      <b-card
        v-for="card in cards"
        :key="card.id"
        :title="card.title"
        :img-src="card.image.src"
        :img-alt="card.image.alt"
        img-top
        no-body
        v-on:click="navigate(card.id)"
        class="shadow-sm text-center"
      >
        <b-card-body class="d-flex flex-column">
          <b-card-text>
            {{ card.text }}
          </b-card-text>
          <b-button
            variant="primary"
            v-on:click="navigate(card.id)"
            class="mt-auto"
            >{{ card.button }}</b-button
          >
        </b-card-body>
      </b-card>
    </b-card-group>
  </div>
</template>

<style scoped>
.card:hover {
  -webkit-box-shadow: 5px 5px 22px -7px #000000 !important;
  box-shadow: 5px 5px 22px -7px #000000 !important;
}
</style>
<script lang="ts">
import Vue from 'vue';

const cards = [
  {
    id: 'Client',
    image: {
      src: 'images/client.jpg',
      alt: 'Client image',
    },
    title: 'Užívateľská aplikácia',
    text: 'Registrácia užívateľa a zadávanie požiadaviek',
    button: 'Užívateľ',
  },
  {
    id: 'Server',
    image: {
      src: 'images/server.jpg',
      alt: 'Server image',
    },
    title: 'Správa serveru',
    text: 'Konfigurácia a monitorovanie parametrov serveru',
    button: 'Server',
  },
  {
    id: 'Simulation',
    image: {
      src: 'images/simulation.jpg',
      alt: 'Simulation image',
    },
    title: 'Simulácia požiadaviek',
    text: 'Generovanie náhodných užívateľských požiadaviek',
    button: 'Simulácia',
  },
];

export default Vue.extend({
  props: {
    bus: Vue,
  },

  data() {
    return { cards };
  },

  methods: {
    navigate(to: string) {
      this.$parent.$emit('navigate', to);
    },
  },
});
</script>
