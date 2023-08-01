// database.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm'

export const databaseConfig: TypeOrmModuleOptions = {
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '',
    database: 'stock',
    entities: ['dist/**/*.entity{.ts,.js}'],
    synchronize: true,
}
