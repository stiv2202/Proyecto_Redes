import CryptoJS from "crypto-js";
import { secretKey } from "./key";

export const encrypt = (user, password) => {
    const encryptedUser = CryptoJS.AES.encrypt(user, secretKey).toString();
    const encryptedPassword = CryptoJS.AES.encrypt(password, secretKey).toString();

    return JSON.stringify({
        user: encryptedUser,
        password: encryptedPassword
    })
}

export const decrypt = (session) => {
    session = JSON.parse(session)
    const encryptedUser = session.user;
    const encryptedPassword = session.password;

    const user = CryptoJS.AES.decrypt(encryptedUser, secretKey).toString(CryptoJS.enc.Utf8);
    const password = CryptoJS.AES.decrypt(encryptedPassword, secretKey).toString(CryptoJS.enc.Utf8);

    return { user, password };
}