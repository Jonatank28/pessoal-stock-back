import { Module } from '@nestjs/common'
import { AppService } from './app.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { databaseConfig } from './services/databaseConfig'
import { LoginController } from './controllers/login.controller'
import { TransactionController } from './controllers/transaction.controller'
import { DataInitialController } from './controllers/dataInitial.controller'

@Module({
    imports: [TypeOrmModule.forRoot(databaseConfig)],
    controllers: [
        LoginController,
        TransactionController,
        DataInitialController,
    ],
    providers: [AppService],
})
export class AppModule {}
