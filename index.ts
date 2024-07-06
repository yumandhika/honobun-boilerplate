import figlet from 'figlet';
import app from './app'
import { envConfig } from './config/config';

Bun.serve({
  fetch: app.fetch,
  hostname: envConfig.app.host,
  port: envConfig.app.port,
});

figlet("Axel API",
  {
    horizontalLayout: "default",
    verticalLayout: "default",
    width: 80,
    whitespaceBreak: true,
  },
  function (err, data) {
  if (err) {
    console.log("Something went wrong...");
    console.dir(err);
    return;
  }
  console.log(data);
  console.log(`Server Running ${envConfig.app.host}:${envConfig.app.port}`);
  console.log(`Bun Version ${Bun.version}`);
});