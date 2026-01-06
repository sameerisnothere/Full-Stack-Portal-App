import * as openpgp from "openpgp";
import fs from "fs";

const privateKeyArmored = fs.readFileSync("./utils/server_private.asc", "utf8");

let cachedPrivateKey;

async function loadPrivateKey() {
  if (!cachedPrivateKey) {
    const privateKey = await openpgp.readPrivateKey({
      armoredKey: privateKeyArmored,
    });

    const pgpPass = process.env.PGP_PASSPHRASE;

    cachedPrivateKey = await openpgp.decryptKey({
      privateKey,
      passphrase: pgpPass,
    });
  }
  return cachedPrivateKey;
}

export async function pgpDecrypt(encrypted) {
  const privateKey = await loadPrivateKey();

  const message = await openpgp.readMessage({
    armoredMessage: encrypted,
  });

  const { data } = await openpgp.decrypt({
    message,
    decryptionKeys: privateKey,
  });

  return JSON.parse(data);
}
