import { ShowDatabase } from "../data/ShowDatabase";
import { CustomError } from "./errors/CustomError";
import { Show, ShowInputDTO } from "./models/ShowModel";
import { SHOW_DAY } from "./models/ShowModel";
import { Authenticator } from "./services/Authenticator";
import { HashManager } from "./services/HashManager";
import { IdGenerator } from "./services/IdGenerator";

export class ShowBusiness {
    constructor(
        private authenticator: Authenticator,
        private idGenerator: IdGenerator,
        private showDatabase: ShowDatabase
    ) { }

    async createShow(input: ShowInputDTO, token: string) {
        try {
            const { week_day, start_time, end_time, band_id } = input

            if (!token) {
                throw new CustomError(498, "Não autorizado")
            }

            const tokenData = this.authenticator.getTokenData(token)

            if (tokenData.role !== "ADMIN") {
                throw new CustomError(401, "Usuário não autorizado")
            }

            if (!week_day || !start_time || !end_time || !band_id) {
                throw new CustomError(422, "Preencha os campos corretamente")
            }

            if (week_day.toUpperCase() !== SHOW_DAY.FRIDAY || week_day.toUpperCase() !== SHOW_DAY.SATURDAY || week_day.toUpperCase() !== SHOW_DAY.SUNDAY) {
                throw new CustomError(400, "O week_day selecionado é inválido!! Selecione entre FRIDAY, SATURDAY ou SUNDAY")
            }

            if (start_time < 8 || start_time > 23) {
                throw new CustomError(400, "Horário inválido")
            }
            if (end_time < start_time || end_time === start_time) {
                throw new CustomError(400, "Horário inválido")
            }

            const alreadyExist = await this.showDatabase.alreadyExist(week_day, start_time)

            if (alreadyExist) {
                throw new CustomError(500, "Data e horário já registrados no cronograma de shows")
            }

            const id = this.idGenerator.generateId()

            const newShow: any = {
                id,
                week_day,
                start_time,
                end_time,
                band_id
            }

            await this.showDatabase.createShow(newShow)
        } catch (error: any) {
            throw new Error("Erro ao registrar show - business1")
        }
    }
}