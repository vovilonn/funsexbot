import { IDesirePossibility } from "./../types/services";
import { DateInterval } from "./../types/services";
import { Desires } from "../db/models/desires.model";
import config from "../../config.json";
const { fn, Op, where, literal } = require("sequelize");

export function getDesiresCount(interval: DateInterval, userId: number): Promise<number> {
    if (Array.isArray(interval)) {
        return Desires.count({
            where: {
                desireDateTime: { [Op.between]: [interval[0], interval[1]] },
            },
        });
    }

    return Desires.count({
        where: {
            [Op.and]: [
                where(fn("TIMESTAMPDIFF", literal(interval), fn("NOW"), literal("desireDateTime")), {
                    [Op.eq]: 0,
                }),
                { userId },
            ],
        },
    });
}

export function getDesires(interval: DateInterval, userId: number): Promise<Desires[]> {
    if (Array.isArray(interval)) {
        return Desires.findAll({
            where: {
                desireDateTime: { [Op.between]: [interval[0], interval[1]] },
            },
            raw: true,
        });
    }

    return Desires.findAll({
        where: {
            [Op.and]: [
                where(fn("TIMESTAMPDIFF", literal(interval), fn("NOW"), literal("desireDateTime")), {
                    [Op.eq]: 0,
                }),
                { userId },
            ],
        },
        raw: true,
    });
}

export async function checkDesirePossibility(userId: number): Promise<IDesirePossibility> {
    const desire = await Desires.findOne({ where: { userId }, order: [["desireDateTime", "DESC"]], raw: true });
    if (!desire) {
        return { isPossible: true, diff: null };
    }
    const endTime = desire?.desireDateTime?.getTime() + config.desireTimeout * 60 * 1000;
    const isPossible: boolean = endTime <= Date.now();
    const diff: number = endTime - Date.now();
    return { isPossible, diff };
}
