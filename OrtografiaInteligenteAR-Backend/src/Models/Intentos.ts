
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../Config/database";

class Intentos extends Model {
  declare id_intento: number;
  declare id_usuario: number;
  declare id_tema: number;
  declare fecha_inicio: Date;
  declare fecha_fin: Date | null;
  declare total_preguntas: number;
  declare respuestas_correctas: number;
  declare puntaje: number;
  declare estado: string;
}

Intentos.init(
  {
    id_intento: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    id_tema: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    fecha_inicio: {
      type: DataTypes.DATE,
      allowNull: false
    },

    fecha_fin: {
      type: DataTypes.DATE,
      allowNull: true
    },

    total_preguntas: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    respuestas_correctas: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    puntaje: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false
    },

    estado: {
      type: DataTypes.STRING(20),
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: "Intentos",
    timestamps: false
  }
);

export default Intentos;
