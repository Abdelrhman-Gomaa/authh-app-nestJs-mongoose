import { InjectQueue, OnQueueActive, Process, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job, Queue } from 'bull';
import * as nodemailer from 'nodemailer';
import { MailDetails, OptsType } from './send-mail-code.type';
import * as os from 'os';

@Processor('send-mail-code')
@Injectable()
export class SendMailCodeProcessor {
    private transporter: nodemailer.Transporter;
    constructor(
        private readonly configService: ConfigService,
        @InjectQueue('send-mail-code') private readonly mailQueue: Queue
    ) {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            secure: false,
            auth: {
                user: this.configService.get('MAIL_NAME'),
                pass: this.configService.get('MAIL_PASS')
            }
        });
    }

    public async sendMail(opts: OptsType, mailDetails: MailDetails): Promise<void> {
        // run in production mode
        const isProd = this.configService.get('NODE_ENV'); //=== 'production';
        await this.mailQueue.add(
            'send-mail-code',
            { opts, mailDetails },
            { removeOnComplete: isProd, removeOnFail: isProd }
        );
        return;
    }

    @Process({
        name: 'send-mail-code',
        concurrency: os.cpus().length
    })
    async sendEmail(job: Job) {
        const input : MailDetails = job.data
        // console.log('>>>>>>>>>>>>>>>>>>>>>>', input);
        if (!input.from) {
            input.from = this.configService.get('MAIL_NAME');
        }
        if (!input.text) {
            input.text = this.configService.get('DEFAULT_SUBJECT');
        }
        await this.transporter.sendMail(job.data);
    }

    @OnQueueActive()
    onActive(job: Job) {
        console.log(
            `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
        );
    }
}
