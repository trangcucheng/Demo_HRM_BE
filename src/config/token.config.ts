export default () => ({
    token: {
        authTokenSecret: process.env.AUTH_TOKEN_SECRET,
        authTokenName: process.env.AUTH_TOKEN_NAME,
        authExpiresIn: Number(process.env.AUTH_TOKEN_EXP),
        passcodeTokenSecret: process.env.PASSCODE_TOKEN_SECRET,
        passcodeTokenName: process.env.PASSCODE_TOKEN_NAME,
        passcodeExpiresIn: Number(process.env.PASSCODE_TOKEN_EXP),
        refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
        refreshTokenName: process.env.REFRESH_TOKEN_NAME,
        refreshExpiresIn: Number(process.env.REFRESH_TOKEN_EXP)
    }
});
