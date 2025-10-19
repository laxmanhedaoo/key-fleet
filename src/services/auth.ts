export const Auth = {
  validate(token?: string): boolean {
    if (!token) return false;
    return token === process.env.ADMIN_SECRET;
  }
};
