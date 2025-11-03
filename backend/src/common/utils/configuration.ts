export default () => ({
  PORT: parseInt(process.env.PORT ?? '4000', 10),
  JWT_SECRET: process.env.JWT_SECRET || 'super-secret-key',
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '1d',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  AZURE_OPENAI_ENDPOINT: process.env.AZURE_OPENAI_ENDPOINT,
  AZURE_OPENAI_KEY: process.env.AZURE_OPENAI_KEY,
});
