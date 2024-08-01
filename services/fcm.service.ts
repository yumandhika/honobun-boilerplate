import message from '../config/firebase';

export const FcmMessage = (config: { title: any; description: any; data: any; token: any; }) => {

  const unixTimestamp = Math.floor(new Date().getTime() / 1000);
  const code = String(unixTimestamp);

  const msg = {
    notification: {
      title: config.title,
      body: config.description,
    },
    data: {
      ...config.data,
      code,
    },
    android: {
      notification: {
        sound: 'default',
        click_action: 'notification',
      },
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
        },
      },
    },
    token: config.token,
  };

  message
    .send(msg)
    .then((responseMessage: any) => {
      console.log(responseMessage, `>>>>>>> ${config.token}`);
    })
    .catch((err: any) => {
      console.log(err);
    });
};
