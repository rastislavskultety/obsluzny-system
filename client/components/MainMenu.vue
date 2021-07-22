<template>
  <div class="mb-5 mt-2">
    <b-navbar toggleable="lg" type="dark" variant="primary">
      <b-navbar-brand href="#">Obslužný systém</b-navbar-brand>
      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item
            v-for="item in menuItems"
            v-bind:key="item.id"
            v-on:click="navigate(item.id)"
            :active="active == item.id"
          >
            {{ item.label }}
          </b-nav-item>
        </b-navbar-nav>

        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">
          <b-nav-item-dropdown v-if="username" right>
            <!-- Using 'button-content' slot -->
            <template #button-content>
              <em>{{ username }}</em>
            </template>
            <b-dropdown-item @click="logout">Odhlásiť</b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import * as RestApi from './lib/rest-api';

const menuItems = [
  { id: 'Home', label: 'Domov' },
  { id: 'Client', label: 'Užívateľ' },
  { id: 'Server', label: 'Server' },
  { id: 'Simulation', label: 'Simulácia' },
];

export default Vue.extend({
  props: {
    bus: Vue,
  },

  data() {
    return {
      menuItems,
      active: 'Home',
      username: '',
    };
  },

  mounted() {
    this.updateUser();
    this.bus.$on('user', () => this.updateUser());
    this.bus.$on('navigate', (to: string) => (this.active = to));
  },

  methods: {
    navigate(to: string) {
      this.bus.$emit('navigate', to);
    },

    async logout() {
      try {
        await this.$axios.$post('users/logout');
        this.bus.$emit('user', '');
      } catch (e) {
        // do nothing
      }
    },

    async updateUser() {
      this.username = (await RestApi.getCurrentUser(this.$axios)).substr(0, 30);
    },
  },
});
</script>
