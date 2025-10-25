import * as jose from 'jose';
const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET);
const token = await new jose.SignJWT({ role: 'admin', aud: 'authenticated', iss: 'dewrk' })
  .setProtectedHeader({ alg: 'HS256' })
  .setIssuedAt()
  .setExpirationTime('2h')
  .sign(secret);
console.log(token);
