import { neon } from "@neondatabase/serverless";

export const useSql = () => {
  const sql = neon(
    "postgresql://default:ChHbwOT84PFc@ep-broad-breeze-a1hla3yc-pooler.ap-southeast-1.aws.neon.tech/verceldb?sslmode=require"
  );
  return sql;
};
