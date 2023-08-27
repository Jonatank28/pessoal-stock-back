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
            const month = data.data.month_number
            const year = data.data.year

            const getMonthTransactions = `
            SELECT 
                DATE_FORMAT(updateDate, '%Y') AS year,
                DATE_FORMAT(updateDate, '%m') AS month_number,
                CASE DATE_FORMAT(updateDate, '%m')
                    WHEN '01' THEN 'Janeiro'
                    WHEN '02' THEN 'Fevereiro'
                    WHEN '03' THEN 'Março'
                    WHEN '04' THEN 'Abril'
                    WHEN '05' THEN 'Maio'
                    WHEN '06' THEN 'Junho'
                    WHEN '07' THEN 'Julho'
                    WHEN '08' THEN 'Agosto'
                    WHEN '09' THEN 'Setembro'
                    WHEN '10' THEN 'Outubro'
                    WHEN '11' THEN 'Novembro'
                    WHEN '12' THEN 'Dezembro'
                END AS month_name
            FROM transaction
            WHERE userID = ?
                AND typeID IN (1, 2)
            GROUP BY year, month_number, month_name
            ORDER BY year, month_number DESC;

             `
            const resultGetMonthTransactions = await this.db.query(
                getMonthTransactions,
                [userID]
            )

            // Parametros padrão
            const parametersDefault = [
                userID,
                year ?? resultGetMonthTransactions[0].year,
                month ?? resultGetMonthTransactions[0].month_number,
            ]

            const sqlGet = `
            SELECT
                ROUND(SUM(CASE WHEN t.typeID = 2 THEN t.value ELSE 0 END), 2) AS revenue,
                ROUND(SUM(CASE WHEN t.typeID = 1 THEN t.value ELSE 0 END), 2) AS expense,
                ROUND(SUM(CASE WHEN t.typeID = 2 THEN t.value ELSE 0 END) - SUM(CASE WHEN t.typeID = 1 THEN t.value ELSE 0 END), 2) AS currentBalance
            FROM transaction AS t
            WHERE t.userID = ?
            AND YEAR(t.updateDate) = ?
            AND MONTH(t.updateDate) = ?
            LIMIT 1;;
            `
            const resultSqlGet = await this.db.query(sqlGet, parametersDefault)

            const sqlGroupMonth = `
            SELECT 
                CASE 
                    WHEN DATE(a.updateDate) = CURDATE() THEN 'Hoje'
                    WHEN DATE(a.updateDate) = DATE_SUB(CURDATE(), INTERVAL 1 DAY) THEN 'Ontem'
                    ELSE CONCAT(
                        CASE DAYOFWEEK(a.updateDate)
                            WHEN 1 THEN 'Domingo'
                            WHEN 2 THEN 'Segunda-feira'
                            WHEN 3 THEN 'Terça-feira'
                            WHEN 4 THEN 'Quarta-feira'
                            WHEN 5 THEN 'Quinta-feira'
                            WHEN 6 THEN 'Sexta-feira'
                            WHEN 7 THEN 'Sábado'
                        END,
                        ', ',
                        DATE_FORMAT(a.updateDate, '%d')
                    )
                END as day_date,
                SUM(CASE WHEN a.typeID = 1 THEN a.value ELSE 0 END) as revenue,
                SUM(CASE WHEN a.typeID = 2 THEN a.value ELSE 0 END) as expense,
                SUM(CASE WHEN a.typeID = 2 THEN a.value ELSE 0 END) - SUM(CASE WHEN a.typeID = 1 THEN a.value ELSE 0 END) as net_amount
            FROM transaction AS a
                WHERE userID = ?
                AND typeID IN (1, 2)
                AND YEAR(a.updateDate) = ?  
                AND MONTH(a.updateDate) = ?
                GROUP BY day_date
                ORDER BY a.updateDate DESC
            `

            const sqlGetTransaction = `
            SELECT 
                a.transactionID,
                a.description, 
                CASE 
                WHEN DATE(a.updateDate) = CURDATE() THEN 'Hoje'
                WHEN DATE(a.updateDate) = DATE_SUB(CURDATE(), INTERVAL 1 DAY) THEN 'Ontem'
                ELSE CONCAT(
                    CASE DAYOFWEEK(a.updateDate)
                        WHEN 1 THEN 'Domingo'
                        WHEN 2 THEN 'Segunda-feira'
                        WHEN 3 THEN 'Terça-feira'
                        WHEN 4 THEN 'Quarta-feira'
                        WHEN 5 THEN 'Quinta-feira'
                        WHEN 6 THEN 'Sexta-feira'
                        WHEN 7 THEN 'Sábado'
                    END,
                    ', ',
                    DATE_FORMAT(a.updateDate, '%d')
                    )
                END as day_date,
                a.value,
                (SELECT c.name FROM tag AS c  WHERE c.tagID = a.tagID) as tagID,
                (SELECT b.name FROM type AS b WHERE b.typeID = a.typeID) as typeID  
            FROM  transaction AS a
            WHERE userID = ?
            AND typeID IN (1, 2)
            AND YEAR(a.updateDate) = ?  
            AND MONTH(a.updateDate) = ?
            ORDER BY
                CASE
                    WHEN DATE(a.updateDate) = CURDATE() THEN 1
                    WHEN DATE(a.updateDate) = DATE_SUB(CURDATE(), INTERVAL 1 DAY) THEN 2
                    ELSE 3
                END, a.updateDate DESC;
            `

            const resultSqlGroupMonth = await this.db.query(
                sqlGroupMonth,
                parametersDefault
            )
            const resultsqlGetTransaction = await this.db.query(
                sqlGetTransaction,
                parametersDefault
            )

            const transactionsByMonth = new Array(
                resultSqlGroupMonth.length
            ).fill([])

            resultSqlGroupMonth.forEach(
                ({ day_date, revenue, expense, net_amount }, index) => {
                    transactionsByMonth[index] = {
                        day: day_date,
                        revenue,
                        expense,
                        net_amount,
                        transactions: [],
                    }
                }
            )

            resultsqlGetTransaction.forEach((transaction) => {
                const { day_date } = transaction
                const monthIndex = resultSqlGroupMonth.findIndex(
                    (item) => item.day_date === day_date
                )
                if (monthIndex !== -1) {
                    transactionsByMonth[monthIndex].transactions.push(
                        transaction
                    )
                }
            })

            const sqlGetTypes = 'SELECT typeID AS id, name FROM type'
            const resultSqlGetTypes = await this.db.query(sqlGetTypes)
            const sqlGetTags = 'SELECT tagID AS id, name FROM tag'
            const resultSqlGetTags = await this.db.query(sqlGetTags)

            const result = {
                balanceGlobal: resultSqlGet[0],
                transactionsGroup: transactionsByMonth,
                tags: resultSqlGetTags,
                types: resultSqlGetTypes,
                months: resultGetMonthTransactions,
            }

            res.status(201).json(result)
        } catch (error) {
            console.log(error)
        }
    }
}
