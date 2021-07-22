<template>
  <b-card>
    <b-jumbotron
      header="Registrácia užívateľa"
      lead="Zvolťe si ľubovoľné užívateľské meno."
      bg-variant="white"
    >
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
      </form>
    </b-jumbotron>
  </b-card>
</template>

<script lang="ts">
import Vue from 'vue';

import Spinner from './Spinner.vue';

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
      (this.$refs.spinner as any).hide();
      this.username = '';
      this.formState = FormState.input;
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
      let spinner = this.$refs.spinner as any;
      this.formState = FormState.request;
      spinner.show();

      this.$axios
        .$post('users/register', { username: this.username })
        .then(async (result: Object) => {
          this.formState = FormState.registered;
          this.bus.$emit('user', this.username);
          this.bus.$emit('showSuccess', 'Registrácia bola úspešná.');
          spinner.hide();
        })
        .catch((err: Object) => {
          this.formState = FormState.input;
          this.bus.$emit(
            'showError',
            'Nie je možné registrovať, skúste prosím neskôr.'
          );
          spinner.hide();
        });
    },
  },
});
</script>
