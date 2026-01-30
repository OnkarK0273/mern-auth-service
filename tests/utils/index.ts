export const isJwt = (token: string | null): boolean => {
  if (token === null) {
    return false;
  }
  const parts = token.split('.');

  // if jwt token not has not in 3 part
  if (parts.length !== 3) {
    return false;
  }

  // if token are in encoded format
  try {
    parts.forEach((part) => {
      Buffer.from(part, 'base64').toString('utf-8');
    });
    return true;
  } catch (err) {
    return false;
  }
};
