import dotenv from "dotenv";
import process from "process";
import path from "path";

export const loadConfig = () => {
  const env = process.env;
  const filepath = path.join(process.cwd(), `.env.${env}`);
  dotenv.config({ path: filepath });
};
