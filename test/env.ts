import dotenv from "dotenv";
dotenv.config();

const env = {
  token: process.env.TOKEN!,
  owner: process.env.OWNER!,
  guild: process.env.GUILD!,
};

export default env;
