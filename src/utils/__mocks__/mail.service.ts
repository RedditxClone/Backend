export const EmailServiceMock = {
  // Todo: use subject and body
  sendEmail: (toMail: string, _subject: string, _body: string) =>
    new Promise((resolve, reject) => {
      if (toMail.includes('throw')) {
        reject('Error while sending');
      } else {
        resolve('OK');
      }
    }),
};
