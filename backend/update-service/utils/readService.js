// updateservice/utils/readService
import axios from "axios";

const READ_SERVICE_URL = process.env.READ_SERVICE_URL;

export async function fetchRecord(table, id, includePassword, user, token) {
  try {
    const response = await axios.get(READ_SERVICE_URL, {
      params: { tableName: table, id, includePassword },
      headers: {
        "x-user": JSON.stringify(user),
        Authorization: token,
      },
    });

    // gateway already decrypted
    return response.data.data || [];
  } catch (err) {
    console.error("READ-SERVICE ERROR:", err?.response?.data || err);
    return null;
  }
}
