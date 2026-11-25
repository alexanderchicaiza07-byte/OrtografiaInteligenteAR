
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../Config/database";

class Preguntas extends Model {
  declare id_pregunta: number;
  declare id_tema: number;
  declare enunciado: string;
  declare explicacion: string | null;
  declare estado: boolean;
}

Preguntas.init(
  {
    id_pregunta: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    id_tema: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    enunciado: {
      type: DataTypes.STRING(500),
      allowNull: false
    },

    explicacion: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  {
    sequelize,
    tableName: "Preguntas",
    modelName: "Preguntas",
    timestamps: false
  }
);

export default Preguntas;
