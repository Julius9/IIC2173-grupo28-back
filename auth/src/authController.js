const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./userModel'); // Asegúrate de que la ruta al modelo de usuario sea correcta

const saltRounds = 10; // Para bcrypt

const register = async (req, res) => {
  try {
    // Obtener datos del cuerpo de la solicitud
    const { mail, username, password } = req.body;

    // Validar aquí si lo necesitas...

    // Hashear la contraseña antes de guardarla en la base de datos
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear el usuario
    const newUser = await User.create({
      mail,
      username,
      password: hashedPassword,
      dinero: 5000 // El valor predeterminado definido en la migración
    });

    // Respuesta al cliente
    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    // Manejo de errores
    res.status(400).json({ message: "Error creating user", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { mail, password } = req.body;
    const user = await User.findOne({ where: { mail } });

    if (!user) {
      return res.status(401).json({ message: "Authentication failed. User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Authentication failed. Wrong password." });
    }

    let scopeSample;
    if (user.admin) {
      scopeSample = ['admin', 'user'];
    } else {
      scopeSample = ['user'];
    }
    
    const token = jwt.sign({ id: user.id, scope: scopeSample}, process.env.JWT_SECRET, {
      expiresIn: '1h' // Expira en una hora, puedes cambiarlo según tus necesidades
    });

    res.json({ message: "User logged in successfully", token });
  } catch (error) {
    res.status(400).json({ message: "Error logging in", error: error.message });
  }
};

module.exports = {
  register,
  login
};
