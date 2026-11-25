
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import TokenRecuperacion from "../Models/TokenRecuperacion";
import { Op } from "sequelize";
import { sequelize } from "../Config/database";
import Usuario from "../Models/Usuarios";

// =========================================
// COOKIES: DESARROLLO Y PRODUCCIÓN
// =========================================
// Vercel y Render tienen dominios diferentes.
// En producción, SameSite=None requiere Secure=true.
const esProduccion = process.env.NODE_ENV === "production";

const opcionesCookie = {
  httpOnly: true,
  secure: esProduccion,
  sameSite: (esProduccion ? "none" : "lax") as "none" | "lax",
  path: "/"
};

// =========================================
// 1. REGISTRAR ESTUDIANTE
// =========================================

export const registrarUsuario = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Recibir datos del frontend
    const { nombre, apellido, correo, password } = req.body;

    // Verificar campos obligatorios
    if (
      typeof nombre !== "string" ||
      typeof apellido !== "string" ||
      typeof correo !== "string" ||
      typeof password !== "string" ||
      !nombre.trim() ||
      !apellido.trim() ||
      !correo.trim() ||
      !password
    ) {
      res.status(400).json({
        ok: false,
        mensaje: "Todos los campos son obligatorios"
      });
      return;
    }

    // Validar correo
    const correoLimpio = correo.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio)) {
      res.status(400).json({
        ok: false,
        mensaje: "Correo electrónico inválido"
      });
      return;
    }

    // Validar contraseña
    if (password.length < 8) {
      res.status(400).json({
        ok: false,
        mensaje: "La contraseña debe tener al menos 8 caracteres"
      });
      return;
    }

    // Buscar si el correo ya existe
    const usuarioExiste = await Usuario.findOne({
      where: { correo: correoLimpio }
    });

    if (usuarioExiste) {
      res.status(409).json({
        ok: false,
        mensaje: "El correo ya está registrado"
      });
      return;
    }

    // Proteger contraseña con bcrypt
    const passwordHash = await bcrypt.hash(password, 12);

    // Crear estudiante en SQL Server
    const nuevoUsuario = await Usuario.create({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      correo: correoLimpio,
      password_hash: passwordHash,
      rol: "ESTUDIANTE",
      estado: true
    });

    // Responder sin devolver la contraseña
    res.status(201).json({
      ok: true,
      mensaje: "Estudiante registrado correctamente",
      usuario: {
        id_usuario: nuevoUsuario.id_usuario,
        nombre: nuevoUsuario.nombre,
        apellido: nuevoUsuario.apellido,
        correo: nuevoUsuario.correo,
        rol: nuevoUsuario.rol
      }
    });

  } catch (error) {
    console.error("Error al registrar usuario:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error interno al registrar usuario"
    });
  }
};

// =========================================
// 2. INICIAR SESIÓN
// =========================================

export const iniciarSesion = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { correo, password } = req.body;

    // Validar datos recibidos
    if (
      typeof correo !== "string" ||
      typeof password !== "string" ||
      !correo.trim() ||
      !password
    ) {
      res.status(400).json({
        ok: false,
        mensaje: "Ingrese correo y contraseña"
      });
      return;
    }

    // Buscar usuario
    const usuario = await Usuario.findOne({
      where: {
        correo: correo.trim().toLowerCase()
      }
    });

    if (!usuario) {
      res.status(401).json({
        ok: false,
        mensaje: "Credenciales incorrectas"
      });
      return;
    }

    // Verificar si el usuario está activo
    if (!usuario.estado) {
      res.status(403).json({
        ok: false,
        mensaje: "Usuario inactivo"
      });
      return;
    }

    // Comparar contraseña
    const passwordCorrecta = await bcrypt.compare(
      password,
      usuario.password_hash
    );

    if (!passwordCorrecta) {
      res.status(401).json({
        ok: false,
        mensaje: "Credenciales incorrectas"
      });
      return;
    }

    // Obtener clave JWT
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("Falta configurar JWT_SECRET");
    }

    // Generar token de sesión
    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario
      },
      jwtSecret,
      {
        expiresIn: "2h"
      }
    );

    // Guardar JWT en cookie
    res.cookie("token", token, {
      ...opcionesCookie,
      maxAge: 2 * 60 * 60 * 1000
    });

    // Respuesta al frontend
    res.status(200).json({
      ok: true,
      mensaje: "Inicio de sesión exitoso",
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error("Error al iniciar sesión:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error interno al iniciar sesión"
    });
  }
};

// =========================================
// 3. CERRAR SESIÓN
// =========================================

export const cerrarSesion = (
  req: Request,
  res: Response
): void => {

  // Eliminar cookie del navegador
  res.clearCookie("token", opcionesCookie);

  res.status(200).json({
    ok: true,
    mensaje: "Sesión cerrada correctamente"
  });
};


// ======================================
// CONSULTAR PERFIL DEL USUARIO
// ======================================

export const obtenerPerfil = (
  req: Request,
  res: Response
): void => {

  // Usuario obtenido por el middleware
  const usuario = res.locals.usuario;

  res.status(200).json({
    ok: true,
    mensaje: "Perfil obtenido correctamente",
    usuario: {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      rol: usuario.rol
    }
  });
};


// Panel de administrador
export const panelAdmin = (
  req: Request,
  res: Response
): void => {

  const usuario = res.locals.usuario;

  res.status(200).json({
    ok: true,
    mensaje: "Bienvenido al panel de administrador",
    usuario: {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      rol: usuario.rol
    }
  });
};


export const recuperarClave = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {

    // 1. Recibir correo
    const { correo } = req.body;

    if (typeof correo !== "string" || !correo.trim()) {
      res.status(400).json({
        ok: false,
        mensaje: "Ingrese su correo electrónico"
      });
      return;
    }

    // 2. Verificar configuración SMTP
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;

    if (!smtpHost || !smtpUser || !smtpPassword) {
      throw new Error("Falta configurar SMTP");
    }

    // 3. Buscar usuario en SQL Server
    const usuario = await Usuario.findOne({
      where: {
        correo: correo.trim().toLowerCase(),
        estado: true
      }
    });

    // Respuesta genérica para proteger las cuentas
    const mensaje =
      "Si el correo está registrado, recibirá un enlace de recuperación";

    if (!usuario) {
      res.status(200).json({
        ok: true,
        mensaje
      });
      return;
    }

    // 4. Generar token temporal
    const token = crypto.randomBytes(32).toString("hex");

    // Guardar únicamente el hash del token
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // 5. Configurar duración de 15 minutos
    const fechaActual = new Date();

    const fechaExpiracion = new Date(
      fechaActual.getTime() + 15 * 60 * 1000
    );

    // 6. Invalidar tokens anteriores del usuario
    await TokenRecuperacion.update(
      { revocado: true },
      {
        where: {
          id_usuario: usuario.id_usuario,
          fecha_uso: null,
          revocado: false
        }
      }
    );

    // 7. Guardar token en SQL Server
    await TokenRecuperacion.create({
      id_usuario: usuario.id_usuario,
      token_hash: tokenHash,
      fecha_creacion: fechaActual,
      fecha_expiracion: fechaExpiracion,
      fecha_uso: null,
      revocado: false
    });

    // 8. Crear enlace de recuperación
    const urlFrontend =
      process.env.FRONTEND_URL || "http://localhost:5173";

    const enlace =
      `${urlFrontend}/restablecer-clave?token=${token}`;

    // 9. Configurar servidor de correo
    const transporte = nodemailer.createTransport({
      host: smtpHost,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: smtpUser,
        pass: smtpPassword
      }
    });

    // 10. Enviar correo
    await transporte.sendMail({
      from: process.env.SMTP_FROM || smtpUser,
      to: usuario.correo,
      subject: "Recuperación de contraseña - Ortografía AR",
      text:
        `Hola ${usuario.nombre},\n\n` +
        "Para restablecer tu contraseña, ingresa al enlace:\n" +
        enlace + "\n\n" +
        "Este enlace vence en 15 minutos.\n\n" +
        "Si no solicitaste el cambio, ignora este correo."
    });

    // 11. Responder al frontend
    res.status(200).json({
      ok: true,
      mensaje
    });

  } catch (error) {

    console.error("Error al recuperar contraseña:", error);

    res.status(500).json({
      ok: false,
      mensaje: "No se pudo procesar la recuperación"
    });
  }
};


// =======================================
// VALIDAR TOKEN DE RECUPERACIÓN
// =======================================

export const validarToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {

    // Recibir token
    const { token } = req.body;

    if (
      typeof token !== "string" ||
      !/^[a-f0-9]{64}$/.test(token)
    ) {
      res.status(400).json({
        ok: false,
        mensaje: "Token inválido"
      });
      return;
    }

    // Generar hash del token recibido
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Buscar token válido
    const tokenGuardado = await TokenRecuperacion.findOne({
      where: {
        token_hash: tokenHash,
        revocado: false,
        fecha_uso: null,
        fecha_expiracion: {
          [Op.gt]: new Date()
        }
      }
    });

    if (!tokenGuardado) {
      res.status(400).json({
        ok: false,
        mensaje: "El enlace es inválido o ha expirado"
      });
      return;
    }

    // Comprobar que el usuario siga activo
    const usuario = await Usuario.findByPk(
      tokenGuardado.id_usuario
    );

    if (!usuario || !usuario.estado) {
      res.status(400).json({
        ok: false,
        mensaje: "El enlace es inválido o ha expirado"
      });
      return;
    }

    res.status(200).json({
      ok: true,
      mensaje: "Token válido"
    });

  } catch (error) {
    console.error("Error al validar token:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al validar el token"
    });
  }
};


// =======================================
// RESTABLECER CONTRASEÑA
// =======================================

export const restablecerClave = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {

    // 1. Recibir información
    const { token, password, confirmarPassword } = req.body;

    // 2. Validar datos
    if (
      typeof token !== "string" ||
      typeof password !== "string" ||
      typeof confirmarPassword !== "string"
    ) {
      res.status(400).json({
        ok: false,
        mensaje: "Todos los campos son obligatorios"
      });
      return;
    }

    if (!/^[a-f0-9]{64}$/.test(token)) {
      res.status(400).json({
        ok: false,
        mensaje: "Token inválido"
      });
      return;
    }

    // 3. Validar contraseña
    if (password.length < 8) {
      res.status(400).json({
        ok: false,
        mensaje: "La contraseña debe tener mínimo 8 caracteres"
      });
      return;
    }

    if (password !== confirmarPassword) {
      res.status(400).json({
        ok: false,
        mensaje: "Las contraseñas no coinciden"
      });
      return;
    }

    // 4. Generar hash del token
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // 5. Proteger nueva contraseña
    const passwordHash = await bcrypt.hash(password, 12);

    // 6. Realizar operación en una transacción
    let tokenInvalido = false;

    try {
      await sequelize.transaction(async (transaction) => {

        // Marcar el token como utilizado
        // Solamente si sigue vigente
        const [actualizados] = await TokenRecuperacion.update(
          {
            revocado: true,
            fecha_uso: new Date()
          },
          {
            where: {
              token_hash: tokenHash,
              revocado: false,
              fecha_uso: null,
              fecha_expiracion: {
                [Op.gt]: new Date()
              }
            },
            transaction
          }
        );

        if (actualizados === 0) {
          throw new Error("TOKEN_INVALIDO");
        }

        // Obtener registro del token
        const tokenGuardado = await TokenRecuperacion.findOne({
          where: { token_hash: tokenHash },
          transaction
        });

        if (!tokenGuardado) {
          throw new Error("TOKEN_INVALIDO");
        }

        // Buscar usuario
        const usuario = await Usuario.findByPk(
          tokenGuardado.id_usuario,
          { transaction }
        );

        if (!usuario || !usuario.estado) {
          throw new Error("TOKEN_INVALIDO");
        }

        // Actualizar contraseña
        await usuario.update(
          {
            password_hash: passwordHash,
            fecha_actualizacion: new Date()
          },
          { transaction }
        );

        // Invalidar otros tokens pendientes
        await TokenRecuperacion.update(
          { revocado: true },
          {
            where: {
              id_usuario: usuario.id_usuario,
              revocado: false
            },
            transaction
          }
        );

      });

    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "TOKEN_INVALIDO"
      ) {
        tokenInvalido = true;
      } else {
        throw error;
      }
    }

    if (tokenInvalido) {
      res.status(400).json({
        ok: false,
        mensaje: "El enlace es inválido o ha expirado"
      });
      return;
    }

    // 7. Eliminar cookie de sesión actual
    res.clearCookie("token", opcionesCookie);

    // 8. Responder
    res.status(200).json({
      ok: true,
      mensaje: "Contraseña actualizada correctamente"
    });

  } catch (error) {

    console.error("Error al restablecer contraseña:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al restablecer contraseña"
    });
  }
};
