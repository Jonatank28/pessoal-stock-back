import { Module } from '@nestjs/common'
import { LoginController } from './controllers/login.controller'
import { AppService } from './app.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { databaseConfig } from './services/databaseConfig'

@Module({
    imports: [TypeOrmModule.forRoot(databaseConfig)],
    controllers: [LoginController],
    providers: [AppService],
})
export class AppModule {}
