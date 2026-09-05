import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

function getEncryptionKey() {
  const encoded =
    process.env.TEVUAH_SENSITIVE_DATA_KEY;

  if (!encoded) {
    throw new Error(
      "TEVUAH_SENSITIVE_DATA_KEY is not configured.",
    );
  }

  const key =
    Buffer.from(
      encoded,
      "base64",
    );

  if (key.length !== 32) {
    throw new Error(
      "TEVUAH_SENSITIVE_DATA_KEY must decode to exactly 32 bytes.",
    );
  }

  return key;
}

export function encryptSensitiveValue(
  plaintext: string,
) {
  const value =
    plaintext.trim();

  if (!value) {
    return null;
  }

  const iv =
    randomBytes(
      IV_LENGTH,
    );

  const cipher =
    createCipheriv(
      ALGORITHM,
      getEncryptionKey(),
      iv,
    );

  const ciphertext =
    Buffer.concat([
      cipher.update(
        value,
        "utf8",
      ),
      cipher.final(),
    ]);

  const tag =
    cipher.getAuthTag();

  return [
    "v1",
    iv.toString("base64"),
    tag.toString("base64"),
    ciphertext.toString("base64"),
  ].join(".");
}


export function decryptSensitiveValue(
  encryptedValue: string,
) {
  const value =
    encryptedValue.trim();

  if (!value) {
    throw new Error(
      "Encrypted value is empty.",
    );
  }

  const parts =
    value.split(".");

  if (
    parts.length !== 4 ||
    parts[0] !== "v1"
  ) {
    throw new Error(
      "Unsupported encrypted value format.",
    );
  }

  const [
    ,
    ivEncoded,
    tagEncoded,
    ciphertextEncoded,
  ] = parts;

  const iv =
    Buffer.from(
      ivEncoded,
      "base64",
    );

  const tag =
    Buffer.from(
      tagEncoded,
      "base64",
    );

  const ciphertext =
    Buffer.from(
      ciphertextEncoded,
      "base64",
    );

  if (
    iv.length !==
    IV_LENGTH
  ) {
    throw new Error(
      "Invalid encrypted value IV.",
    );
  }

  const decipher =
    createDecipheriv(
      ALGORITHM,
      getEncryptionKey(),
      iv,
    );

  decipher.setAuthTag(
    tag,
  );

  const plaintext =
    Buffer.concat([
      decipher.update(
        ciphertext,
      ),
      decipher.final(),
    ]);

  return plaintext.toString(
    "utf8",
  );
}
