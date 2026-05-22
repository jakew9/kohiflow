import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jakew9.kohiflow',
  appName: 'Kōhī-Flow Tracker',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
