
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../Config/database";

class Opciones extends Model {
  declare id_opcion: number;
  declare id_pregunta: number;
  declare texto: string;
  declare es_correcta: boolean;
  declare orden: number;
}

Opciones.init(
  {
    id_opcion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    id_pregunta: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    texto: {
      type: DataTypes.STRING(300),
      allowNull: false
    },

    es_correcta: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },

    orden: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: "Opciones",
    modelName: "Opciones",
    timestamps: false
  }
);

export default Opciones;
