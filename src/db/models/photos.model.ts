import { Table, Column, Model, PrimaryKey, Unique, AutoIncrement } from "sequelize-typescript";

@Table({
    modelName: "photos",
})
export class Photos extends Model {
    @AutoIncrement
    @PrimaryKey
    @Unique
    @Column
    id: string;

    @Column
    userId: number;

    @Column
    photoDateTime: Date;
}
