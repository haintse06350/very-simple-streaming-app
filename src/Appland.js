import axios from "axios";
// const jwt = require("jsonwebtoken");

const STREAMING_CREATE_GAME_PATH = "/api/streaming-games/create/";
const APPLAND_ENDPOINT =
  process.env.APPLAND_ENDPOINT ||
  "https://streaming-api-dev.appland-stream.com";
const STAGE = process.env.STAGE || "dev";
const REGION = process.env.REGION || "us-east-1";

const RSA_PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----
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
-----END RSA PRIVATE KEY-----`;

const JWT_ALG = "RS256";
const JWT_ISS_DEFAULT = "rob0";
const JWT_STORE_DEFAULT = "STEALTH01";

const JWT_PAYLOAD_DEFAULT = {
  iss: JWT_ISS_DEFAULT,
  store: JWT_STORE_DEFAULT,
  userId: "user-123",
  appId: 140302,
  deviceInfo: "",
  continueGame: "false",
  gameSessionSource: "moment-creation-admin-ui",
  gameSessionSourceEnvironment: STAGE === "prodindia" ? "prod" : STAGE,
  gameSessionSourceRegion: REGION,
};

const createJwtExp = () => Math.round(Date.now() / 1000) + 30; // Token lifetime of 30 seconds

const createToken = (payload) => {
  const payloadToSign = {
    ...JWT_PAYLOAD_DEFAULT,
    ...payload,
    exp: createJwtExp(),
  };

  // return jwt.sign(payloadToSign, RSA_PRIVATE_KEY, { algorithm: JWT_ALG });
};

// interface ICreateStreamParams {
//   appId: string;
//   userId: string;
//   deviceInfo: string;
//   gameSnapshotId?: string;
//   gameMomentId?: string;
//   screenSize?: string;
//   username: string;
//   isE2E?: boolean;
// }

class Appland {
  static createStream = async (params) => {
    const {
      appId,
      userId,
      deviceInfo,
      gameSnapshotId,
      gameMomentId,
      screenSize,
      username,
      isE2E,
    } = params;

    const payload = {
      appId: parseInt(appId, 10),
      userId,
      username,
      deviceInfo: JSON.parse(deviceInfo),
    };

    /**
     * It uses a specific Appland region for e2e tests to avoid triggering a system error from Appland.
     * Appland has a maximum of edge nodes running at the same time and the limit is often reached on dev region
     */
    if (isE2E) {
      payload.region = "us-east-1";
    }

    if (gameSnapshotId) {
      payload.gameSnapshotId = gameSnapshotId;
      if (gameMomentId) {
        payload.gameSessionSource = "consumer-ui";
        payload.gameMomentId = gameMomentId;
      }
    }

    if (screenSize) {
      payload.screenSize = screenSize;
    }

    const token = createToken(payload);

    try {
      const url = `${APPLAND_ENDPOINT}${STREAMING_CREATE_GAME_PATH}?token=${token}`;
      console.log(url);
      const response = await axios.get(url);
      return response.data.edgeNodeId;
    } catch (e) {
      console.error(e.message);
      return null;
    }
  };

  /**
   * Fetch Appland streaming endpoint
   *
   * @returns {string}
   */
  static fetchStreamingEndpoint = () => {
    return APPLAND_ENDPOINT;
  };
}

export default Appland;
