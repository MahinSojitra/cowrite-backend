import argon2 from 'argon2';

export const password = {
  hash(value: string): Promise<string> {
    return argon2.hash(value, { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 });
  },
  verify(hash: string, plain: string): Promise<boolean> {
    return argon2.verify(hash, plain);
  }
};
