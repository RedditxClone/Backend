export const EmailServiceMock = {
  sendEmail: (toMail: string, _subject: string, _body: string) =>
    new Promise((resolve, reject) => {
      if (toMail.includes('throw')) {
        reject('Error while sending');
      } else {
        resolve('OK');
      }
    }),
};
