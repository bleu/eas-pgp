import * as openpgp from "openpgp";

export const getKeyFingerprint = async (
  pgpPublicKey: string,
): Promise<string> => {
  const key = await openpgp.readKey({ armoredKey: pgpPublicKey });
  return key.getFingerprint().toUpperCase();
};
