import IORedis from 'ioredis';
import { BullModule } from '@nestjs/bull';
import { Global, MiddlewareConsumer, Module } from '@nestjs/common';
import { Response } from 'express';
import { CreateClientTypeEnum } from './bull.interfaces';
import { QueueUIProvider } from './bull-board.provider';

const connectionOptions = {
    host: process.env.REDIS_HOST,
    port: +process.env.REDIS_PORT,
    // password: env.REDIS_PASS,
    // ...(env.REDIS_DATABASE_INDEX !== undefined && { db: +env.REDIS_DATABASE_INDEX }),
    maxRetriesPerRequest: null,
    enableReadyCheck: false
  },
  client = new IORedis(connectionOptions),
  subscriber = new IORedis(connectionOptions);

// Queue(queueName: string, url?: string, opts?: QueueOptions): Queue

const queues = [
    BullModule.registerQueue({ name: 'send-mail-code' })
];

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: async () => ({
        createClient(type: CreateClientTypeEnum) {
          switch (type) {
            case CreateClientTypeEnum.client:
              return client;
            case CreateClientTypeEnum.subscriber:
              return subscriber;
            default:
              return new IORedis(connectionOptions);
          }
        },
        defaultJobOptions: { removeOnComplete: false, removeOnFail: false }
      })
    }),
    ...queues
  ],
  providers: [QueueUIProvider],
  exports: [...queues]
})
export class NestBullModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply((_, res: Response, next: any) => {
        if (process.env.NODE_ENV === 'production') return res.sendStatus(401);
        next();
      }, QueueUIProvider.router)
      .forRoutes('/admin/queues');
  }
}
