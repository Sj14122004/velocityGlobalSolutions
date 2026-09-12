import bcrypt from "bcrypt";

const PASSWORD_PEPPER = process.env.PASSWORD_PEPPER;

if (!PASSWORD_PEPPER) {
  throw new Error("PASSWORD_PEPPER is not defined");
}

export const hashPassword = async (
  password: string
): Promise<string> => {
  return bcrypt.hash(password + PASSWORD_PEPPER, 10);
};

export const comparePassword = async (
  password: string,
  passwordHash: string
): Promise<boolean> => {
  return bcrypt.compare(
    password + PASSWORD_PEPPER,
    passwordHash
  );
};