import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";

dotenv.config();

const DB_HOST: string = process.env.SSH ? process.env.HOST : process.env.DB_HOST;

export const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: DB_HOST,
    dialect: "mysql",
    port: +process.env.DB_PORT,
    models: [__dirname + "/models/*.model.ts"],
    modelMatch: (filename, member) =>
        filename.substring(0, filename.indexOf(".model")).toLowerCase() === member.toLowerCase(),
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    define: {
        timestamps: false,
    },
    timezone: process.env.DB_TIMEZONE,
});
