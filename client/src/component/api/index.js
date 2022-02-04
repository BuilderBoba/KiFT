/* const axios = require("axios").default;

const api = {
  toGiveContributePoint: async (account, point) => {
    try {
      const headers = {
        "Content-Type": "application/json",
        Accept: "aaplication/json",
      };

      const result = await axios.post("http:localhost:3001/toGiveContributePoint", {
        account: account,
        point: point,
        headers,
      });
      console.log(result);
      return result;
    } catch (e) {
      console.log(e.response);
      return e.response;
    }
  },
};

module.exports = api;
 */
