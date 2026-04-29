<template>
  <v-overlay :model-value="true" persistent class="align-center justify-center custom-login-overlay">
    <v-card width="400" class="pa-8 login-card" elevation="24">
      <div class="text-center mb-6">
        <v-avatar color="green-lighten-5" size="72" class="mb-4">
          <v-icon size="40" color="green-darken-2">mdi-shield-account</v-icon>
        </v-avatar>
        <h1 class="text-h5 font-weight-black tracking-tight green-text">System Access</h1>
        <p class="text-caption text-grey-darken-1 font-weight-bold uppercase-tracking">
          Secure Inventory Login
        </p>
      </div>

      <v-form @submit.prevent="handleLogin">
        <v-text-field
          v-model="userId"
          label="User ID"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-account-badge"
          class="mb-3 modern-input"
          color="green-darken-2"
          placeholder="e.g. ADMIN-001"
          hide-details
        ></v-text-field>

        <v-text-field
          v-model="password"
          label="Password"
          type="password"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-lock-outline"
          class="mb-6 modern-input"
          color="green-darken-2"
          hide-details
        ></v-text-field>

        <v-btn block color="green-darken-2" size="x-large" type="submit" class="login-btn text-white" elevation="4">
          Authenticate
        </v-btn>
      </v-form>

      <v-fade-transition>
        <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mt-4 text-caption" rounded="lg">
          Access Denied. Invalid User ID or Password.
        </v-alert>
      </v-fade-transition>
    </v-card>
  </v-overlay>
</template>

<script>
import { auth } from '../auth';
export default {
  data: () => ({ userId: '', password: '', error: false }),
  methods: {
    handleLogin() {
      if (auth.login(this.userId, this.password)) {
        this.$emit('login-success');
      } else {
        this.error = true;
        setTimeout(() => this.error = false, 3000);
      }
    }
  }
}
</script>

<style scoped>
.custom-login-overlay :deep(.v-overlay__scrim) {
  background: linear-gradient(135deg, #1b5e20 0%, #4caf50 50%, #81c784 100%) !important;
  opacity: 1 !important;
}
.login-card {
  border-radius: 24px !important;
  font-family: 'Inter', sans-serif !important;
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px);
}
.green-text { color: #2e7d32; letter-spacing: -1px !important; }
.login-btn { font-weight: 800; border-radius: 12px; letter-spacing: 1px; }
.uppercase-tracking { letter-spacing: 1.5px; font-size: 0.6rem; text-transform: uppercase; }
</style>