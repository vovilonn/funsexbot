import dotenv from "dotenv";
dotenv.config();

export function getReceiverId(userId: number): number {
    return userId === +process.env.FEMALE_USER_ID ? +process.env.MALE_USER_ID : +process.env.FEMALE_USER_ID;
}
