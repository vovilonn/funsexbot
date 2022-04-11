import { Table, Column, Model, PrimaryKey, Unique, AutoIncrement } from "sequelize-typescript";

@Table({
    modelName: "messages",
})
export class Messages extends Model {
    @AutoIncrement
    @PrimaryKey
    @Unique
    @Column
    id: string;

    @Column
    userId: number;

    @Column
    messageDateTime: Date;
}
