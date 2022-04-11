import { DateInterval } from "./../types/services";
import { Messages } from "../db/models/messages.model";
const { fn, Op, where, literal } = require("sequelize");

export function getMessages(interval: DateInterval, userId: number): Promise<Messages[]> {
    if (Array.isArray(interval)) {
        return Messages.findAll({
            where: {
                desireDateTime: { [Op.between]: [interval[0], interval[1]] },
            },
            raw: true,
        });
    }

    return Messages.findAll({
        where: {
            [Op.and]: [
                where(fn("TIMESTAMPDIFF", literal(interval), fn("NOW"), literal("messageDateTime")), {
                    [Op.eq]: 0,
                }),
                { userId },
            ],
        },
        raw: true,
    });
}
