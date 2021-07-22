<template>
  <b-card>
    <div class="jumbotron">
      <h1 class="display-4">Registrácia užívateľa</h1>
      <p class="lead">
        Pre registráciu si zvolťe užívateľské meno a stlačte tlačidlo.
      </p>

      <form @submit="submit">
        <b-form-group
          id="username-fieldset"
          description="Zadajte vaše užívateľské meno."
          label="Meno užívateľa"
          label-for="username"
          valid-feedback="Thank you!"
          :disabled="formIsDisabled()"
        >
          <b-form-input
            id="username"
            v-model="username"
            placeholder="Užívateľské meno"
            trim
            required
            :disabled="formIsDisabled()"
          ></b-form-input>
        </b-form-group>

        <div class="form-group">
          <b-button
            size="lg"
            type="submit"
            variant="primary"
            :disabled="formIsDisabled()"
          >
            Registruj
            <spinner ref="spinner"></spinner>
          </b-button>
        </div>

        <b-alert variant="danger" :show="!!errorMessage">
          {{ errorMessage }}
        </b-alert>
        <b-alert variant="success" :show="!!successMessage">
          {{ successMessage }}
        </b-alert>
      </form>
    </div>
  </b-card>
</template>

<script lang="ts">
import Vue from 'vue';

import Spinner from './Spinner.vue';
import { sleep } from './lib/sleep';

const SUCCESS_DELAY = 1000;

// Stav formulára:
//   input -> request -> registered
//
enum FormState {
  input,
  request,
  registered,
}

export default Vue.extend({
  props: {
    bus: Vue,
  },

  components: {
    Spinner,
  },

  data: () => ({
    username: '',
    errorMessage: '',
    successMessage: '',
    formState: FormState.input,
  }),

  computed: {
    usernameState() {
      return this.username.length >= 4;
    },
    usernameInvalidFeedback() {
      if (this.username.length > 0) {
        return 'Enter at least 4 characters.';
      }
      return 'Please enter something.';
    },
  },

  methods: {
    clear() {
      this.clearMessages();
      (this.$refs.spinner as any).hide();
      this.username = '';
      this.formState = FormState.input;
    },

    clearMessages() {
      this.errorMessage = '';
      this.successMessage = '';
    },

    formIsDisabled(): boolean {
      return this.formState != FormState.input;
    },

    submit(event: Event) {
      event.preventDefault();
      this.register();
    },

    mounted() {
      (this.$refs.spinner as any).show();
    },

    register() {
      this.clearMessages();

      this.formState = FormState.request;
      (this.$refs.spinner as any).show();

      this.$axios
        .$post('users/register', { username: this.username })
        .then(async (result: Object) => {
          this.formState = FormState.registered;
          (this.$refs.spinner as any).hide();
          this.successMessage = 'Registrácia bola úspešná.';
          await sleep(SUCCESS_DELAY);
          this.bus.$emit('user', this.username);
          this.successMessage = '';
        })
        .catch((err: Object) => {
          this.formState = FormState.input;
          (this.$refs.spinner as any).hide();
          this.errorMessage = 'Nie je možné registrovať, skúste prosím neskôr.';
        });
    },
  },
});
</script>
