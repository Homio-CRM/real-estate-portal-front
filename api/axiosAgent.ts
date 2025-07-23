import axios from "axios";

const axiosAgent = axios.create({
  baseURL: process.env.SUPABASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  },
});

export default axiosAgent; 