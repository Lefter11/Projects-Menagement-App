const setCookie = (res, token) => {
  res.cookie(process.env.COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const clearCookie = (res) => {
  res.clearCookie(process.env.COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
  });
};

module.exports = { setCookie, clearCookie };