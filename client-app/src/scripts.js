function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}
function validateNumberField(value) {
    const regEx = /^\d+(\.\d{1,2})?$/;
    return regEx.test(value);
}
function validateAlphaNumeric(value) {
    const regEx = /^[a-zA-Z0-9 ]+$/;
    return regEx.test(value);
}
function validatePassword(password) {
    // check this to make sure it validates the way the c# files say
    const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return re.test(password);
}
export { validateEmail, validateNumberField, validateAlphaNumeric, validatePassword };