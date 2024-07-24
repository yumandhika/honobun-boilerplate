import { verify } from "hono/utils/jwt/jwt";

const jwtSecret = process.env.JWT_SECRET;

export const authenticateJWT = (requiredRoles: any[]) => {return async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    try {
      const decoded = await verify(token, jwtSecret ?? 'secret');
      c.set('user', decoded);

      if (requiredRoles.length > 0 && !requiredRoles.includes(decoded.role)) {
        return c.json({ status: false, message: 'Forbidden: insufficient role' }, 403);
      }

      await next();
    } catch (err) {
      return c.json({ status: false, message: 'Invalid token' }, 401);
    }
  } else {
    return c.json({ status: false, message: 'Authorization header missing' }, 401);
  }
}};