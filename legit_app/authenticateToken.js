const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  // Obtener el token del encabezado 'Authorization'
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    return res.sendStatus(401); // Si no hay token, retorna un estado 401 Unauthorized
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Retorna un estado 403 Forbidden si el token no es válido
    }

    req.user = user; // Guarda los datos del usuario en el objeto de solicitud
    console.log(req.user)
    next(); // Continúa con el próximo middleware o controlador
  });
};

module.exports = authenticateToken;