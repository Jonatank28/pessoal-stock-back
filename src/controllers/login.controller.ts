import { Body, Controller, Post, Res } from '@nestjs/common'
import { LoginData } from 'src/types/loginData'
import { Connection } from 'typeorm'
import { Response } from 'express'

@Controller('api/auth')
export class LoginController {
    constructor(private readonly db: Connection) {}

    @Post('/login')
    async authLogin(@Body() data: LoginData, @Res() res: Response) {
        const queryResult = await this.db.query('SELECT * FROM user')
        const existUser = queryResult.find(
            (row: any) =>
                row.email === data.email && row.password === data.password
        )

        if (existUser) {
            const user = {
                name: queryResult[0].email,
                userID: queryResult[0].userID,
            }
            res.status(201).json(user)
        } else {
            res.status(401).json({ message: 'recusado' })
        }
    }
}
