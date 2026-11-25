
import { DataTypes, Model, Optional} from "sequelize";
import { sequelize } from "../Config/database";

// Campos de la tabla Usuarios
interface UsuarioAttributes {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  password_hash: string;
  rol: "ADMIN" | "ESTUDIANTE";
  fecha_registro: Date;
  fecha_actualizacion: Date | null;
  estado: boolean;
}

// Campos opcionales durante la creación
type UsuarioCreationAttributes = Optional<
  UsuarioAttributes,
  | "id_usuario"
  | "rol"
  | "fecha_registro"
  | "fecha_actualizacion"
  | "estado"
>;

class Usuario extends Model<
  UsuarioAttributes,
  UsuarioCreationAttributes
> implements UsuarioAttributes {

  declare id_usuario: number;
  declare nombre: string;
  declare apellido: string;
  declare correo: string;
  declare password_hash: string;
  declare rol: "ADMIN" | "ESTUDIANTE";
  declare fecha_registro: Date;
  declare fecha_actualizacion: Date | null;
  declare estado: boolean;
}

Usuario.init(
  {
    id_usuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },

    apellido: {
      type: DataTypes.STRING(100),
      allowNull: false
    },

    correo: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true
    },

    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },

    rol: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "ESTUDIANTE"
    },

    fecha_registro: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },

    fecha_actualizacion: {
      type: DataTypes.DATE,
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
    modelName: "Usuario",
    tableName: "Usuarios",
    timestamps: false,
    freezeTableName: true
  }
);

export default Usuario;
