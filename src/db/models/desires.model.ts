import { Table, Column, Model, PrimaryKey, Unique, AutoIncrement } from "sequelize-typescript";

@Table({
    modelName: "desires",
})
export class Desires extends Model {
    @AutoIncrement
    @PrimaryKey
    @Unique
    @Column
    id: string;

    @Column
    userId: number;

    @Column
    desireDateTime: Date;
}
