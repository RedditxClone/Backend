export const EmailServiceMock = {
  sendEMail: (toMail: string, subject: string, body: string) => {
    return new Promise((resolve, reject) => {
      if (toMail === 'throw') {
        reject('Error while sending');
      } else resolve('OK');
    });
  },
};
