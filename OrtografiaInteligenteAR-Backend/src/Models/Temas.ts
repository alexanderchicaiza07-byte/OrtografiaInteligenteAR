
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../Config/database";

class Temas extends Model {
  declare id_tema: number;
  declare nombre: string;
  declare descripcion: string | null;
  declare orden: number;
  declare estado: boolean;
}

Temas.init(
  {
    id_tema: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },

    descripcion: {
      type: DataTypes.STRING(500),
      allowNull: true
    },

    orden: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  {
    sequelize,
    tableName: "Temas",
    modelName: "Temas",
    timestamps: false
  }
);

export default Temas;
