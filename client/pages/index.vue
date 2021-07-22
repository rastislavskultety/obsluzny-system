<template>
  <div>
    <div class="container">
      <main-menu :bus="bus"></main-menu>
      <b-alert variant="danger">Message</b-alert>

      <h1 class="display-3">Obslužný systém</h1>
      <keep-alive>
        <div :is="currentComponent" v-bind="currentProperties"></div>
      </keep-alive>
    </div>

    <div class="spacer"></div>
    <sim :bus="bus"></sim>
  </div>
</template>

<style scoped>
.spacer {
  height: 64px;
}
</style>

<script lang="ts">
import Vue from 'vue';
import Home from '../components/Home.vue';
import Client from '../components/Client.vue';
import Server from '../components/Server.vue';
import Simulation from '../components/Simulation.vue';
import MainMenu from '../components/MainMenu.vue';
import Register from '../components/Register.vue';
import Sim from '../components/Sim.vue';

// // Create WebSocket connection.
// const socket = new WebSocket('ws://localhost:8080');

// // Connection opened
// socket.addEventListener('open', function (event) {
//   socket.send('Hello Server!');
// });

// // Listen for messages
// socket.addEventListener('message', function (event) {
//   console.log('Message from server ', event.data);
// });

// var W3CWebSocket = require('websocket').w3cwebsocket;

// var client = new W3CWebSocket('ws://localhost:8090/', 'echo-protocol');

// client.onerror = function () {
//   console.log('Connection Error');
// };

// client.onopen = function () {
//   console.log('WebSocket Client Connected');

//   function sendNumber() {
//     if (client.readyState === client.OPEN) {
//       var number = Math.round(Math.random() * 0xffffff);
//       client.send(number.toString());
//       setTimeout(sendNumber, 1000);
//     }
//   }
//   sendNumber();
// };

// client.onclose = function () {
//   console.log('echo-protocol Client Closed');
// };

// client.onmessage = function (e) {
//   if (typeof e.data === 'string') {
//     console.log("Received: '" + e.data + "'");
//   }
// };

export default Vue.extend({
  components: {
    MainMenu,
    Register,
    Home,
    Client,
    Server,
    Simulation,
    Sim,
  },

  data: () => ({
    currentComponent: 'Home', // Menu aktuálne zobrazenej komponenty (Home / Client / Server / Simulation)
    bus: new Vue(),
  }),

  computed: {
    currentProperties: function () {
      return { bus: this.bus };
    },
  },

  mounted() {
    // Vložené komponenty MainMenu a Home posielajú navigačné udalosti.
    // Parametrom je meno komponentu kam sa má navigovať
    this.$on('navigate', (to: string) => {
      this.currentComponent = to;
    });

    // Po tom ako sa zaregistruje užívateľ, tak sa aktualizuje menu kde je jeho meno
    this.$on('login', (username: string) => {
      // this.$refs.menu.$emit('login', username)
    });

    this.bus.$on('navigate', (to: string) => {
      this.currentComponent = to;
    });
  },
});
</script>
