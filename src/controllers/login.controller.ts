import { Body, Controller, Post, Res } from '@nestjs/common'
import { loginProps } from 'src/types/login'
import { Connection } from 'typeorm'
import { Response } from 'express'

@Controller('api/auth')
export class LoginController {
    constructor(private readonly db: Connection) {}

    @Post('/login')
    async authLogin(@Body() data: loginProps, @Res() res: Response) {
        try {
            const sql = 'SELECT * FROM user WHERE email = ?'
            const queryResult = await this.db.query(sql, [data.email])
            const existUser = queryResult.find(
                (row: any) =>
                    row.email === data.email && row.password === data.password
            )
            if (existUser) {
                const user = {
                    email: queryResult[0].email,
                    userID: queryResult[0].userID,
                }
                res.status(201).json(user)
            } else {
                res.status(401).json({ message: 'Usuário não encontrado!' })
            }
        } catch (error) {
            console.log(error)
        }
    }
}
