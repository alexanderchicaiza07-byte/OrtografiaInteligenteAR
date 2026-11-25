
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../Config/database";

class Lecciones extends Model {
  declare id_leccion: number;
  declare id_tema: number;
  declare titulo: string;
  declare contenido: string;
  declare ejemplos: string | null;
  declare orden: number;
  declare estado: boolean;
}

Lecciones.init(
  {
    id_leccion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    id_tema: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    titulo: {
      type: DataTypes.STRING(150),
      allowNull: false
    },

    contenido: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    ejemplos: {
      type: DataTypes.TEXT,
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
    tableName: "Lecciones",
    modelName: "Lecciones",
    timestamps: false
  }
);

export default Lecciones;
