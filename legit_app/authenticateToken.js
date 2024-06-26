const jwt = require('jsonwebtoken');

function getJWTscope(token) {
  const secret = process.env.JWT_SECRET;
  const payload = jwt.verify(token, secret);
  return payload.scope;
}

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
    req.scope = getJWTscope(token);
    next(); // Continúa con el próximo middleware o controlador
  });
};

async function isUser(req, res, next) {
  await next();
  const token = req.headers['authorization'].split(' ')[1];
  const scope = getJWTscope(token);
  if (!scope.includes('user')) {
    return res.status(403).send('No tienes permisos para realizar esta acción');
  }
}

async function isAdmin(req, res, next) {
  await next();
  const token = req.headers['authorization'].split(' ')[1];
  const scope = getJWTscope(token);
  if (!scope.includes('admin')) {
    return res.status(403).send('No tienes permisos para realizar esta acción');
  }

}

module.exports = {
  authenticateToken,
  isUser,
  isAdmin,
};