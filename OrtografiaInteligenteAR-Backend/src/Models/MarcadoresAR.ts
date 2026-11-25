
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../Config/database";

class MarcadoresAR extends Model {
  declare id_marcador: number;
  declare id_tema: number;
  declare nombre: string;
  declare archivo_marcador: string;
  declare contenido_ar: string;
  declare estado: boolean;
}

MarcadoresAR.init(
  {
    id_marcador: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    id_tema: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },

    archivo_marcador: {
      type: DataTypes.STRING(300),
      allowNull: false
    },

    contenido_ar: {
      type: DataTypes.TEXT,
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
    tableName: "Marcadores_AR",
    modelName: "MarcadoresAR",
    timestamps: false
  }
);

export default MarcadoresAR;
