import {
    Body,
    Param,
    Controller,
    Delete,
    Post,
    Res,
    Put,
    Get,
} from '@nestjs/common'
import { transactionNewProps } from 'src/types/transaction/new'
import { Connection } from 'typeorm'
import { Response } from 'express'

@Controller('api/transaction')
export class TransactionController {
    constructor(private readonly db: Connection) {}

    @Get('/getData/:id')
    async TransactionGet(@Body() data, @Res() res: Response) {
        try {
            console.log('chegou no getdata', data)
            // const sqlDelete = 'DELETE FROM transaction WHERE transactionID = ?'
            // const resultSqlInsert = await this.db.query(sqlDelete, [id])
            // res.status(201).json({
            //     message: 'Transação excluida com sucesso!',
            // })
        } catch (error) {
            console.log(error)
        }
    }

    // Cria nova transação
    @Post('/new')
    async TransactionNew(
        @Body() data: transactionNewProps,
        @Res() res: Response
    ) {
        try {
            const sqlInsert = 'INSERT INTO transaction SET ?'
            const resultSqlInsert = await this.db.query(sqlInsert, [data])

            res.status(201).json({
                message: 'Cadastro realizado com sucesso!',
            })
        } catch (error) {
            console.log(error)
        }
    }

    // Deleta transação existente
    @Delete('/delete/:id')
    async TransactionDelete(@Param('id') id: number, @Res() res: Response) {
        try {
            const sqlDelete = 'DELETE FROM transaction WHERE transactionID = ?'
            const resultSqlInsert = await this.db.query(sqlDelete, [id])

            res.status(201).json({
                message: 'Transação excluida com sucesso!',
            })
        } catch (error) {
            console.log(error)
        }
    }

    // Deleta transação existente
    @Put('/update/:id')
    async TransactionUpdate(@Body() data, @Res() res: Response) {
        try {
            console.log('chegou no update', data)
            // const sqlDelete = 'DELETE FROM transaction WHERE transactionID = ?'
            // const resultSqlInsert = await this.db.query(sqlDelete, [id])
            // res.status(201).json({
            //     message: 'Transação excluida com sucesso!',
            // })
        } catch (error) {
            console.log(error)
        }
    }
}
