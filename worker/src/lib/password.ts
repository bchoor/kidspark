function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function hashPassword(password: string): Promise<{
  hash: string;
  salt: string;
  iterations: number;
}> {
  const saltBuffer = new Uint8Array(16);
  crypto.getRandomValues(saltBuffer);

  const iterations = 100000;

  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations,
      hash: 'SHA-256',
    },
    passwordKey,
    256
  );

  return {
    hash: bufferToBase64(derivedBits),
    salt: bufferToBase64(saltBuffer.buffer),
    iterations,
  };
}

export async function verifyPassword(
  password: string,
  storedHash: string,
  salt: string,
  iterations: number
): Promise<boolean> {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const saltBuffer = base64ToBuffer(salt);
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations,
      hash: 'SHA-256',
    },
    passwordKey,
    256
  );

  // Timing-safe comparison
  const derivedHash = new Uint8Array(derivedBits);
  const storedHashBuffer = new Uint8Array(base64ToBuffer(storedHash));

  if (derivedHash.length !== storedHashBuffer.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < derivedHash.length; i++) {
    result |= derivedHash[i] ^ storedHashBuffer[i];
  }

  return result === 0;
}
