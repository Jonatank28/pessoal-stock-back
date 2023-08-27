import { Controller, Get, Param, Res } from '@nestjs/common'
import { Connection } from 'typeorm'
import { Response } from 'express'
import { generateRandomColor } from 'src/services/default'

@Controller('api/graphics/:userID')
export class GraphicsController {
    constructor(private readonly db: Connection) {}

    @Get()
    async Graphics(@Param('userID') userID: number, @Res() res: Response) {
        try {
            const sqlPye = `
            SELECT
                a.name AS tag,
                ROUND(SUM(b.value), 2) AS valueTotal,
                ROUND((SUM(b.value) / t.total) * 100, 2) AS percentage
            FROM tag AS a
            JOIN transaction AS b ON (a.tagID = b.tagID)
            JOIN
                (SELECT
                    userID,
                    typeID,
                    ROUND(SUM(value), 2) AS total
                FROM transaction
                WHERE userID = ? AND typeID = 1
                GROUP BY userID, typeID) AS t ON (b.userID = t.userID AND b.typeID = t.typeID)
            WHERE b.userID = ? AND b.typeID = 1
            GROUP BY a.name, t.total
            `
            const resultSqlPye = await this.db.query(sqlPye, [userID, userID])

            const chartData = {
                labels: resultSqlPye.map((entry) => entry.tag),
                datasets: [
                    {
                        data: resultSqlPye.map((entry) => entry.valueTotal),
                        backgroundColor: resultSqlPye.map(() =>
                            generateRandomColor()
                        ),
                        borderColor: resultSqlPye.map(() => '#ffffff'),
                        borderWidth: 1,
                    },
                ],
            }

            const values = {
                pie: chartData,
            }

            res.status(200).json(values)
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Internal server error' })
        }
    }
}
