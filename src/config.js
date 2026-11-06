// Configuració de l'aplicació
export const config = {
  port: process.env.PORT || 3000,
  enviaments: {
    url: 'https://api.enviaments.example.com/v1',
    apiKey: process.env.ENVIAMENTS_API_KEY,
  },
};
