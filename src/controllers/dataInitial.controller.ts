import { Body, Controller, Post, Res } from '@nestjs/common'
import { Connection } from 'typeorm'
import { Response } from 'express'
import { transactionProps } from 'src/types/transaction'

@Controller('api/dataInitial')
export class DataInitialController {
    constructor(private readonly db: Connection) {}

    @Post()
    async DataInitial(@Body() data, @Res() res: Response) {
        try {
            const userID = data.data.userID
            const sqlGet = `
            SELECT
                ROUND(COALESCE((SELECT SUM(b.value) FROM transaction AS b WHERE b.typeID = 2 AND b.userID = a.userID), 0), 2) AS revenue,
                ROUND(COALESCE((SELECT SUM(c.value) FROM transaction AS c WHERE c.typeID = 1 AND c.userID = a.userID), 0), 2) AS expense,
                ROUND(COALESCE((SELECT SUM(b.value) FROM transaction AS b WHERE b.typeID = 2 AND b.userID = a.userID), 0) - COALESCE((SELECT SUM(c.value) FROM transaction AS c WHERE c.typeID = 1 AND c.userID = a.userID), 0), 2) AS currentBalance
            FROM transaction AS a
            WHERE a.userID = ?
            LIMIT 1;
            `
            const resultSqlGet = await this.db.query(sqlGet, [userID])
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
            WHERE userID = ?
            ORDER BY 1 DESC;
            `
            const resultsqlGetTransaction = await this.db.query(
                sqlGetTransaction,
                [userID]
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
