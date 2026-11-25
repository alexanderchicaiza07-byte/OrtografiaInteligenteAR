
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../Config/database";

class Respuestas extends Model {
  declare id_respuesta: number;
  declare id_intento: number;
  declare id_pregunta: number;
  declare id_opcion: number;
  declare es_correcta: boolean;
  declare fecha_respuesta: Date;
}

Respuestas.init(
  {
    id_respuesta: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    id_intento: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    id_pregunta: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    id_opcion: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    es_correcta: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },

    fecha_respuesta: {
      type: DataTypes.DATE,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: "Respuestas",
    timestamps: false
  }
);

export default Respuestas;
