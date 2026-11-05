export function jwtSecret() {
  const secret=process.env.JWT_SECRET;
  if (!secret || Buffer.byteLength(secret)<32) throw new Error('Configura JWT_SECRET con al menos 32 bytes aleatorios en backend/.env');
  return secret;
}
export const tokenOptions={algorithm:'HS256',expiresIn:'1h',issuer:'dulce-encanto',audience:'dulce-encanto-web'};
