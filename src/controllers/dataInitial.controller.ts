import { Body, Controller, Post, Res } from '@nestjs/common'
import { Connection } from 'typeorm'
import { Response } from 'express'

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
                CASE 
                WHEN DATE(a.creationDate) = CURDATE() THEN 'Hoje'
                WHEN DATE(a.creationDate) = DATE_SUB(CURDATE(), INTERVAL 1 DAY) THEN 'Ontem'
                ELSE CONCAT(
                    CASE DAYOFWEEK(a.creationDate)
                        WHEN 1 THEN 'Domingo'
                        WHEN 2 THEN 'Segunda-feira'
                        WHEN 3 THEN 'Terça-feira'
                        WHEN 4 THEN 'Quarta-feira'
                        WHEN 5 THEN 'Quinta-feira'
                        WHEN 6 THEN 'Sexta-feira'
                        WHEN 7 THEN 'Sábado'
                    END,
                    ', ',
                    DATE_FORMAT(a.creationDate, '%d')
                    )
                END as day_date,
                a.value,
                (SELECT c.name FROM tag AS c  WHERE c.tagID = a.tagID) as tagID,
                (SELECT b.name FROM type AS b WHERE b.typeID = a.typeID) as typeID  
            FROM  transaction AS a
            WHERE userID = ?
            ORDER BY a.transactionID DESC;
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
