export async function hybridEncrypt(data) {
  const text = JSON.stringify(data);

  // Fetch RSA public key
  const publicKeyPem = await fetch("/server_public.pem").then(r => r.text());
  const rsaKey = await crypto.subtle.importKey(
    "spki",
    pemToArrayBuffer(publicKeyPem),
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"]
  );

  // Generate AES key
  const aesKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt"]
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt data
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    new TextEncoder().encode(text)
  );

  //  Split ciphertext + authTag
  const encryptedBytes = new Uint8Array(encryptedBuffer);
  const authTag = encryptedBytes.slice(encryptedBytes.length - 16);
  const ciphertext = encryptedBytes.slice(0, encryptedBytes.length - 16);

  // Encrypt AES key with RSA
  const rawAesKey = await crypto.subtle.exportKey("raw", aesKey);
  const encryptedKey = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    rsaKey,
    rawAesKey
  );

  return {
    encryptedKey: btoa(String.fromCharCode(...new Uint8Array(encryptedKey))),
    iv: btoa(String.fromCharCode(...iv)),
    data: btoa(String.fromCharCode(...ciphertext)),
    authTag: btoa(String.fromCharCode(...authTag)), //  REQUIRED
  };
}


function pemToArrayBuffer(pem) {
  const clean = pem.replace(/-----.*-----/g, "").replace(/\s+/g, "");
  const binary = atob(clean);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return buffer;
}
