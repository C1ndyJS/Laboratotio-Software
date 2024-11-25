const db = require("../config/db.config");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const saltRounds = 10; // Número de rondas de sal

const register = async (nombreusuario, nombres, apellidos, email, contraseña, genero, dni, fechaNacimiento, paisNacimiento, estadoNacimiento, ciudadNacimiento,direccionFacturacion, imagenUsuario) => {
  try {
    // Cifrar la contraseña antes de almacenarla
    const hashedPassword = await bcrypt.hash(contraseña, saltRounds);

    return new Promise((resolve, reject) => {
      const query = `INSERT INTO usuarios (NombreUsuario, NombreCompleto, Email, Contraseña, Genero, Cedula) VALUES (?, ?, ?, ?, ?, ?,?, ?, ?, ?,?, ?,?, ?)`;
      const values = [nombreusuario, nombres, apellidos, email, contraseña, genero, dni, fechaNacimiento, paisNacimiento, estadoNacimiento, ciudadNacimiento,direccionFacturacion, imagenUsuario]; // Usa el hash en lugar de la contraseña

      console.log("Query:", query);
      console.log("Values:", values);

      db.query(query, values, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve({ id: results.insertId, nombreusuario, email });
        }
      });
    });
  } catch (error) {
    throw new Error("Error al registrar el usuario");
  }
};



// Inicio de sesión de usuario
const login = (email, contraseña) => {
  return new Promise((resolve, reject) => {
    console.log("Intentando iniciar sesión con email:", email); // Log del email que se está usando
    const query = "SELECT * FROM usuarios WHERE Email = ?";
    db.query(query, [email], (err, results) => {
      if (err) {
        console.error("Error al ejecutar la consulta:", err); // Log del error de consulta
        return reject(err);
      }

      // Verifica si se encontraron resultados
      if (results.length === 0) {
        console.log("Usuario no encontrado con el email:", email); // Log de error
        return reject("Usuario no encontrado");
      }

      const user = results[0]; // Aquí ya puedes acceder a 'user'
      console.log("Usuario encontrado:", user); // Log del usuario encontrado

      // Verificar la contraseña
      bcrypt.compare(contraseña, user.Contraseña, (err, isMatch) => {
        if (err) {
            console.error("Error al comparar contraseñas:", err);
            return reject(err);
        }
    
        console.log("Contraseña ingresada:", contraseña);
        console.log("Contraseña almacenada:", user.Contraseña);
    
        if (!isMatch) {
            console.log("Contraseña incorrecta para el usuario:", user.NombreUsuario);
            return reject("Contraseña incorrecta");
        }
    
        // Generar token JWT
        const token = jwt.sign({ id: user.UsuarioID, nombreusuario: user.NombreUsuario }, "secreto", { expiresIn: '1h' });
        resolve({ token, user });
    });
    
    });
  });
};




// Obtener todos los vuelos desde la base de datos
const getAllFlights = () => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM vuelos", (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

// Crear un nuevo vuelo en la base de datos
const createFlight = (flightDetails) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO vuelos
      (CodigoVuelo, FechaVuelo, HoraSalida, Origen, Destino, DuracionVuelo, HoraLlegadaLocal, CostoPorPersona, EsInternacional)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      flightDetails.CodigoVuelo,
      flightDetails.FechaVuelo,
      flightDetails.HoraSalida,
      flightDetails.Origen,
      flightDetails.Destino,
      flightDetails.DuracionVuelo,
      flightDetails.HoraLlegadaLocal,
      flightDetails.CostoPorPersona,
      flightDetails.EsInternacional

    ];

    db.query(query, values, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};


const cancelFlight = (CodigoVuelo) => {
  return new Promise((resolve, reject) => {
    const query = `DELETE FROM vuelos WHERE CodigoVuelo = ?`;
    db.query(query, [CodigoVuelo], (err, result) => {
      if (err) {
        return reject(err);
      }
      if (result.affectedRows === 0) {
        return reject("El vuelo no existe o ya ha sido cancelado.");
      }
      resolve({ message: "Vuelo cancelado exitosamente." });
    });
  });
};



const createCard = async ({ numero, titular, fechaExpiracion, cvv }) => {
  // Verificar si ya existe una tarjeta con el mismo número
  const [existingCard] = await db.promise().query(
    "SELECT * FROM tarjetas WHERE numero = ?",
    [numero]
  );

  if (existingCard.length > 0) {
    throw new Error("Tarjeta ya existe");
  }

  // Insertar nueva tarjeta en la base de datos
  const [result] = await db.promise().query(
    "INSERT INTO tarjetas (numero, titular, fechaExpiracion, cvv) VALUES (?, ?, ?, ?)",
    [numero, titular, fechaExpiracion, cvv]
  );

  // Retornar la tarjeta creada con su ID
  return {
    id: result.insertId,
    numero,
    titular,
    fechaExpiracion,
    cvv,
  };
};

const deleteCard = async (numero) => {
  // Eliminar tarjeta por ID
  const [result] = await db.promise().query("DELETE FROM tarjetas WHERE numero = ?", [numero]);

  // Si no se eliminó ninguna tarjeta, retornar null
  return result.affectedRows > 0;
};


const BuyTicket = async (nombre, email, vuelo, fechaVuelo, estado,tarjeta,fechacompra) => {
  try {
    const [resultado] = await db.query(
      'INSERT INTO compras (nombre, email, vuelo, fechaVuelo, estado, tarjeta,fechacompra) VALUES (?, ?, ?, ?, ?,?,?)',
      [nombre, email, vuelo, fechaVuelo, estado, tarjeta,fechacompra]
    );
    return resultado;
  } catch (error) {
    throw new Error('Error al realizar la compra');
  }
};


const contarTiquetesPorPersona = async (email) => {
  const [rows] = await db.query('SELECT COUNT(*) AS total FROM compras WHERE email = ?', [email]);
  return rows[0].total;
};

const obtenerCompraPorId = async (id) => {
  const [rows] = await db.query('SELECT * FROM compras WHERE id = ?', [id]);
  return rows[0];
};

const cancelarCompra = async (id) => {
  const [result] = await db.query('UPDATE compras SET estado = ? WHERE id = ?', ['cancelada', id]);
  return result.affectedRows > 0;
};

// Crear una nueva reserva
const crearReserva = async (nombre, email, vuelo, fecha) => {
  const [result] = await db.query(
    'INSERT INTO reservas (nombre, email, vuelo, fechaVuelo, estado, expiracion) VALUES (?, ?, ?, ?, ?, NOW() + INTERVAL 24 HOUR)',
    [nombre, email, vuelo, fecha, 'reservada']
  );
  return result.insertId;
};

// Obtener reserva por ID
const obtenerReservaPorId = async (id) => {
  const [rows] = await db.query('SELECT * FROM reservas WHERE id = ?', [id]);
  return rows[0];
};

// Cancelar una reserva
const cancelarReserva = async (id) => {
  const [result] = await db.query('UPDATE reservas SET estado = ? WHERE id = ?', ['cancelada', id]);
  return result.affectedRows > 0;
};

// Liberar reservas expiradas (puede ser usado en un proceso programado)
const liberarReservasExpiradas = async () => {
  const [result] = await db.query('UPDATE reservas SET estado = ? WHERE expiracion <= NOW() AND estado = ?', ['liberada', 'reservada']);
  return result.affectedRows;
};


module.exports = {
  register,
  login,
  getAllFlights,
  createFlight,
  cancelFlight,
  createCard,
  deleteCard,
  BuyTicket,
  obtenerCompraPorId,
  cancelarCompra,
  contarTiquetesPorPersona,
  crearReserva,
  obtenerReservaPorId,
  cancelarReserva,
  liberarReservasExpiradas
};
