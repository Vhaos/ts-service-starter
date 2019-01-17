import Kue from 'kue';
import env from '@app/common/config/env';
import { injectable } from 'inversify';

export interface EmailData {
  to: string;
  subject: string;
  text?: string;
  html: string;
}

const Queue = Kue.createQueue({
  redis: env.redis_url,
  jobEvents: false,
});

Queue.on('job complete', function(id, result) {
  Kue.Job.get(id, function(err, job) {
    if (err) return console.log(err);
    job.remove(function(err) {
      if (err) return console.log('an error occured while removing job');
    });
  });
});

@injectable()
export default class QueueService {
  sendEmail(emailData: EmailData) {
    Queue.create('email', emailData)
      .attempts(3)
      .save();
  }
}

export interface IQueueService {
  sendEmail(emailData: EmailData);
}
