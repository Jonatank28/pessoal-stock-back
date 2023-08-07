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
import { transactionUpdateProps } from 'src/types/transaction/update'

@Controller('api/transaction')
export class TransactionController {
    constructor(private readonly db: Connection) {}

    // Enviar dados para o front para edição
    @Get('/getData/:id')
    async TransactionGet(@Param('id') id: number, @Res() res: Response) {
        try {
            const sqlgetData =
                'SELECT transactionID, value, description, typeID, tagID, updateDate FROM transaction WHERE transactionID = ?'
            const resultSqlgetData = await this.db.query(sqlgetData, [id])
            res.status(200).json(resultSqlgetData[0])
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
    @Put('/update')
    async TransactionUpdate(
        @Body() data: transactionUpdateProps,
        @Res() res: Response
    ) {
        try {
            const sqlUpdate =
                'UPDATE transaction SET value = ?, description = ?, typeID = ?, tagID = ?, updateDate = ?, userID = ? WHERE transactionID = ?'
            const resultsqlUpdate = await this.db.query(sqlUpdate, [
                data.value,
                data.description,
                data.typeID,
                data.tagID,
                data.updateDate,
                data.userID,
                data.transactionID,
            ])
            res.status(201).json({
                message: 'Transação atualizada com sucesso!',
            })
        } catch (error) {
            console.log(error)
        }
    }
}
