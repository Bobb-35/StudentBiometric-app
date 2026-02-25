const toBase64Url = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const fromBase64Url = (value: string): Uint8Array => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const randomChallenge = (size = 32): Uint8Array => {
  const challenge = new Uint8Array(size);
  crypto.getRandomValues(challenge);
  return challenge;
};

const getCredentialStorageKey = (userId: string) => `webauthn_credential_${userId}`;

const createCredentialIfMissing = async (userId: string, userName: string): Promise<string> => {
  const key = getCredentialStorageKey(userId);
  const existing = localStorage.getItem(key);
  if (existing) return existing;

  const userIdBytes = new TextEncoder().encode(userId);
  const creation = await navigator.credentials.create({
    publicKey: {
      challenge: randomChallenge(),
      rp: { name: 'Biometric Attendance System', id: window.location.hostname },
      user: {
        id: userIdBytes,
        name: `${userId}@local`,
        displayName: userName,
      },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'preferred',
      },
      timeout: 60000,
      attestation: 'none',
    },
  });

  if (!creation || creation.type !== 'public-key') {
    throw new Error('Failed to create biometric credential on this device');
  }

  const credentialId = toBase64Url((creation as PublicKeyCredential).rawId);
  localStorage.setItem(key, credentialId);
  return credentialId;
};

export const authenticateWithDeviceBiometrics = async (userId: string, userName: string) => {
  if (!window.isSecureContext) {
    throw new Error('Biometric sign-in requires HTTPS or localhost');
  }
  if (!('credentials' in navigator) || typeof window.PublicKeyCredential === 'undefined') {
    throw new Error('This browser/device does not support WebAuthn biometrics');
  }

  const credentialId = await createCredentialIfMissing(userId, userName);
  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge: randomChallenge(),
      allowCredentials: [{ id: fromBase64Url(credentialId), type: 'public-key' }],
      userVerification: 'required',
      timeout: 60000,
    },
  });

  if (!assertion || assertion.type !== 'public-key') {
    throw new Error('Biometric verification failed');
  }
};
