import { SendMailCodeModule } from './send-mail-code/send-mail-code.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
      {
        connectionFactory: (connection) => {
          connection.plugin(require('mongoose-autopopulate'));
          connection.plugin(require('mongoose-paginate-v2'));
          return connection;
        }
      }),
    UserModule,
    SendMailCodeModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
