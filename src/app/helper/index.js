import crypto from "crypto";

const hashPassword = (password, salt = "secret") => {
  return crypto.createHmac("sha256", "secret").update(password).digest("hex");
};

module.exports = hashPassword;
