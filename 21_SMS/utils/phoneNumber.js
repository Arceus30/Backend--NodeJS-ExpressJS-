const isValidPhoneNumber = (phone) => {
    return /^\+[1-9]\d{7,14}$/.test(phone);
};
module.exports = { isValidPhoneNumber };
