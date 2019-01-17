import Kue from 'kue';
import Mailgun from 'mailgun-js';

import env from '../../config/env';

interface EmailData {
  to: string;
  subject: string;
  text?: string;
  html: string;
}

const mailgun = new Mailgun({
  apiKey: env.mailgun_api_key,
  domain: env.mailgun_domain,
});

const sender = env.mailgun_email;

const Queue = Kue.createQueue({
  redis: env.redis_url,
  jobEvents: false,
});

Queue.process('email', 10, (job, done) => {
  const emailData: EmailData = job.data;
  const data = {
    from: sender,
    ...emailData,
  };

  mailgun.messages().send(data, err => {
    if (err) {
      console.log(err);
      return done(err);
    }
    console.log('Successfully sent mail');
  });
});

process.on('exit', code => {
  console.log('Bye bye');
});
