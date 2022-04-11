import { DateInterval } from "./../types/services";
import { Photos } from "../db/models/photos.model";
const { fn, Op, where, literal } = require("sequelize");

export function getPhotos(interval: DateInterval, userId: number): Promise<Photos[]> {
    if (Array.isArray(interval)) {
        return Photos.findAll({
            where: {
                desireDateTime: { [Op.between]: [interval[0], interval[1]] },
            },
            raw: true,
        });
    }

    return Photos.findAll({
        where: {
            [Op.and]: [
                where(fn("TIMESTAMPDIFF", literal(interval), fn("NOW"), literal("photoDateTime")), {
                    [Op.eq]: 0,
                }),
                { userId },
            ],
        },
        raw: true,
    });
}
