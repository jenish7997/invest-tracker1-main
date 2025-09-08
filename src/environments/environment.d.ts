declare module 'environments/environment' {
  export const environment: {
    production: boolean;
    firebase: {
      apiKey: string;
      authDomain: string;
      projectId: string;
      storageBucket: string;
      messagingSenderId: string;
      appId: string;
    };
    admin: {
      username: string;
      password: string;
    };
  };
}
