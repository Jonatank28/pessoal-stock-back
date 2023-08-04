import { Body, Controller, Post, Res } from '@nestjs/common'
import { transactionProps } from 'src/types/transaction'
import { Connection } from 'typeorm'
import { Response } from 'express'

@Controller('api/transaction')
export class TransactionController {
    constructor(private readonly db: Connection) {}

    @Post('/new')
    async Transaction(@Body() data: transactionProps, @Res() res: Response) {
        try {
            const sqlInsert = 'INSERT INTO transaction SET ?'
            const resultSqlInsert = await this.db.query(sqlInsert, [data])
            if (resultSqlInsert) {
                res.status(201).json({
                    message: 'Cadastro realizado com sucesso!',
                })
            }
        } catch (error) {
            console.log(error)
        }
    }
}
