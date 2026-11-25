
import {
  DataTypes,
  Model,
  Optional
} from "sequelize";

import { sequelize } from "../Config/database";

interface TokenAttributes {
  id_token: number;
  id_usuario: number;
  token_hash: string;
  fecha_creacion: Date;
  fecha_expiracion: Date;
  fecha_uso: Date | null;
  revocado: boolean;
}

type TokenCreationAttributes = Optional<
  TokenAttributes,
  | "id_token"
  | "fecha_creacion"
  | "fecha_uso"
  | "revocado"
>;

class TokenRecuperacion extends Model<
  TokenAttributes,
  TokenCreationAttributes
> implements TokenAttributes {

  declare id_token: number;
  declare id_usuario: number;
  declare token_hash: string;
  declare fecha_creacion: Date;
  declare fecha_expiracion: Date;
  declare fecha_uso: Date | null;
  declare revocado: boolean;
}

TokenRecuperacion.init(
  {
    id_token: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    token_hash: {
      type: DataTypes.CHAR(64),
      allowNull: false,
      unique: true
    },

    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },

    fecha_expiracion: {
      type: DataTypes.DATE,
      allowNull: false
    },

    fecha_uso: {
      type: DataTypes.DATE,
      allowNull: true
    },

    revocado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    sequelize,
    modelName: "TokenRecuperacion",
    tableName: "Tokens_Recuperacion",
    timestamps: false,
    freezeTableName: true
  }
);

export default TokenRecuperacion;
