export const MailerServiceMock = {
  sendMail: (sendMailOptions: any) =>
    new Promise((resolve, reject) => {
      if (sendMailOptions.to.includes('throw')) {
        reject('Error while sending');
      } else {
        resolve('OK');
      }
    }),
};
