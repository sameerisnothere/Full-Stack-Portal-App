import * as openpgp from "openpgp";

let cachedPublicKey;

async function loadPublicKey() {
  if (!cachedPublicKey) {
    const armoredKey = await fetch("/server_public.asc").then(r => r.text());
    cachedPublicKey = await openpgp.readKey({ armoredKey });
  }
  return cachedPublicKey;
}

export async function pgpEncrypt(payload) {
  const publicKey = await loadPublicKey();

  const message = await openpgp.createMessage({
    text: JSON.stringify(payload),
  });

  return await openpgp.encrypt({
    message,
    encryptionKeys: publicKey,
    format: "armored",
  });
}
