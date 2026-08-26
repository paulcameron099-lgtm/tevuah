import crypto from "crypto";

const ALGORITHM =
  "aes-256-gcm";

/*
 * Convert the environment secret into
 * the 32-byte key required by AES-256.
 *
 * IMPORTANT:
 * Keep the same IDENTITY_ENCRYPTION_KEY
 * value in .env.local.
 *
 * Do NOT generate/change the secret
 * after encrypting production data.
 */
function getEncryptionKey() {
  const secret =
    process.env.IDENTITY_ENCRYPTION_KEY;

  if (!secret) {
    throw new Error(
      "IDENTITY_ENCRYPTION_KEY is missing.",
    );
  }

  /*
   * SHA-256 always produces 32 bytes,
   * which is exactly what AES-256 requires.
   */
  return crypto
    .createHash("sha256")
    .update(
      secret,
      "utf8",
    )
    .digest();
}

export type EncryptedValue = {
  ciphertext: string;
  iv: string;
  authTag: string;
};

/*
 * Encrypt a sensitive plaintext value.
 *
 * Used for:
 * - SSN
 * - Driver's license number
 * - U.S. TIN
 * - Foreign TIN
 */
export function encryptSensitiveValue(
  value: string,
): EncryptedValue {
  if (!value) {
    throw new Error(
      "Cannot encrypt an empty sensitive value.",
    );
  }

  const key =
    getEncryptionKey();

  /*
   * AES-GCM conventionally uses
   * a 12-byte IV.
   *
   * A new random IV must be generated
   * for every encryption operation.
   */
  const iv =
    crypto.randomBytes(12);

  const cipher =
    crypto.createCipheriv(
      ALGORITHM,
      key,
      iv,
    );

  const encrypted =
    Buffer.concat([
      cipher.update(
        value,
        "utf8",
      ),

      cipher.final(),
    ]);

  /*
   * AES-GCM authentication tag protects
   * against ciphertext tampering.
   */
  const authTag =
    cipher.getAuthTag();

  return {
    /*
     * Store binary values as Base64 strings
     * so they can safely live in Postgres
     * TEXT columns.
     */
    ciphertext:
      encrypted.toString(
        "base64",
      ),

    iv:
      iv.toString(
        "base64",
      ),

    authTag:
      authTag.toString(
        "base64",
      ),
  };
}

/*
 * Decrypt a value previously created by
 * encryptSensitiveValue().
 */
export function decryptSensitiveValue(
  encrypted: EncryptedValue,
): string {
  if (
    !encrypted.ciphertext ||
    !encrypted.iv ||
    !encrypted.authTag
  ) {
    throw new Error(
      "Encrypted value is incomplete.",
    );
  }

  const key =
    getEncryptionKey();

  /*
   * Convert the Base64 database values
   * back into their original binary form.
   */
  const iv =
    Buffer.from(
      encrypted.iv,
      "base64",
    );

  const ciphertext =
    Buffer.from(
      encrypted.ciphertext,
      "base64",
    );

  const authTag =
    Buffer.from(
      encrypted.authTag,
      "base64",
    );

  /*
   * AES-GCM requires the same:
   *
   * - algorithm
   * - encryption key
   * - IV
   * - authentication tag
   *
   * that were used during encryption.
   */
  const decipher =
    crypto.createDecipheriv(
      ALGORITHM,
      key,
      iv,
    );

  decipher.setAuthTag(
    authTag,
  );

  const decrypted =
    Buffer.concat([
      decipher.update(
        ciphertext,
      ),

      decipher.final(),
    ]);

  return decrypted.toString(
    "utf8",
  );
}