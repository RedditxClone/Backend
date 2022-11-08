export const EmailServiceMock = {
  sendEmail: (toMail: string, subject: string, body: string) => {
    return new Promise((resolve, reject) => {
      if (toMail.includes('throw')) {
        reject('Error while sending');
      } else resolve('OK');
    });
  },
};
