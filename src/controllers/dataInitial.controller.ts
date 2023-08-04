import { Controller, Get, Res } from '@nestjs/common'
import { Connection } from 'typeorm'
import { Response } from 'express'

@Controller('api/dataInitial')
export class DataInitialController {
    constructor(private readonly db: Connection) {}

    @Get()
    async authLogin(@Res() res: Response) {
        try {
            const sqlGet = `
            SELECT
                ROUND(COALESCE((SELECT SUM(value) FROM transaction WHERE typeID = 2), 0), 2) AS revenue,
                ROUND(COALESCE((SELECT SUM(value) FROM transaction WHERE typeID = 1), 0), 2) AS expense,
                ROUND(COALESCE((SELECT SUM(value) FROM transaction WHERE typeID = 2), 0) - COALESCE((SELECT SUM(value) FROM transaction WHERE typeID = 1), 0), 2) AS currentBalance
            FROM transaction
            LIMIT 1;
            `
            const resultSqlGet = await this.db.query(sqlGet)
            const sqlGetTransaction = `
            SELECT 
            a.transactionID,
                a.description, 
                a.creationDate,
                a.value,
                (SELECT c.name FROM tag AS c  WHERE c.tagID = a.tagID) as tagID,
                (SELECT b.name FROM type AS b WHERE b.typeID = a.typeID) as typeID  
            FROM 
            transaction AS a
            ORDER BY 1 DESC;
            `
            const resultsqlGetTransaction = await this.db.query(
                sqlGetTransaction
            )
            const sqlGetTypes = 'SELECT typeID AS id, name FROM type'
            const resultSqlGetTypes = await this.db.query(sqlGetTypes)
            const sqlGetTags = 'SELECT tagID AS id, name FROM tag'
            const resultSqlGetTags = await this.db.query(sqlGetTags)

            const result = {
                balanceGlobal: resultSqlGet[0],
                transactions: resultsqlGetTransaction,
                tags: resultSqlGetTags,
                types: resultSqlGetTypes,
            }

            res.status(201).json(result)
        } catch (error) {
            console.log(error)
        }
    }
}
