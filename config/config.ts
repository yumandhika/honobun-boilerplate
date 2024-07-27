export const envConfig = {
  app: {
    host: process.env.HOSTNAME,
    port: process.env.PORT
  },
  postgre: {
    url: process.env.DATABASE_POSTGRE_URL,
    host: process.env.DATABASE_POSTGRE_HOST,
    port: process.env.DATABASE_POSTGRE_PORT,
    username: process.env.DATABASE_POSTGRE_USERNAME,
    password: process.env.DATABASE_POSTGRE_PASSWORD,
    db_name: process.env.DATABASE_POSTGRE_NAME
  },
  imgur:{
    url: process.env.IMGUR_API_URL,
    client_id: process.env.IMGUR_CLIENT_ID,
    client_secret: process.env.IMGUR_CLIENT_SECRET,
  },
  jwt:{
    secret: process.env.JWT_SECRET
  }
}