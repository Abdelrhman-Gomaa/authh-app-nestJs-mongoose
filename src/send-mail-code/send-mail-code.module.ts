import { MailerModule } from '@nestjs-modules/mailer';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { SendMailCodeProcessor } from './send-mail-code-processor';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'send-mail-code'
        }),
        MailerModule.forRoot({
            transport: {
                service: 'gmail',
                auth: {
                    user: process.env.MAIL_NAME,
                    pass: process.env.MAIL_PASS
                }
            }
        })
    ],
    providers: [
        SendMailCodeProcessor
    ],
    exports: [SendMailCodeProcessor]
})
export class SendMailCodeModule { }
