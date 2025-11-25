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

function validatePhoneNumber(phone) {
    // Check if phone is exactly 10 digits
    const digits = phone.replace(/\D/g, '');
    return digits.length === 10;
}

function formatPhoneNumber(phone) {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 0) return '';
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)})-${digits.slice(3)}`;
    return `(${digits.slice(0, 3)})-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

function validateZipCode(zipCode) {
    // Check if zip code is exactly 5 digits
    const digits = zipCode.replace(/\D/g, '');
    return digits.length === 5;
}

function validateState(state) {
    // Check if state is exactly 2 letters
    return /^[A-Z]{2}$/.test(state);
}

export { 
    validateEmail, 
    validateNumberField, 
    validateAlphaNumeric, 
    validatePassword,
    validatePhoneNumber,
    formatPhoneNumber,
    validateZipCode,
    validateState
};