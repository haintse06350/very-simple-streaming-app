import axios from "axios";
import * as jsrsasign from "jsrsasign";
import { StreamingController } from "streaming-view-sdk";

const { v4: uuid } = require("uuid");
const { JWS } = jsrsasign.KJUR.jws;

/**
 * Logic for launch a new edge node by send a JWT request to the Streaming Coordinator.
 */
class LauncherEdgeNode {
  static get EDGE_NODE_MODE_SNAPSHOT() {
    return "snapshot";
  }

  static get EDGE_NODE_MODE_BASE_IMAGE() {
    return "base-image";
  }

  static get EDGE_NODE_MODE_APK_IMAGE() {
    return "apk-image";
  }

  static get EDGE_NODE_MODE_ACTIVE_MONITORING() {
    return "active-monitoring";
  }

  /**
   *
   * @param {Object} payload
   * @param {string} payload.host
   * @param {string} payload.issuer
   * @param {string} payload.key
   * @param {string} payload.appId
   * @param {string} payload.newAppId
   * @param {string} payload.apkPackageName
   * @param {string} payload.title
   * @param {string} payload.user
   * @param {string} payload.store
   * @param {string} payload.gameMomentId
   * @param {string} payload.gameSnapshotId
   * @param {string} payload.continueGame
   * @param {string} payload.region
   * @param {string} payload.screenSize
   * @param {string} payload.apkImageUri
   * @param {string} payload.backupUri
   * @param {string} payload.edgeNodeMode
   * @param {string} payload.baseImageUri
   * @param {string} payload.avdConfig
   * @param {string} payload.emulatorVersion
   * @param {string} payload.gameSessionSource
   * @param {{*}}    payload.deviceInfo
   * @param {{*}}    payload.extra
   * @returns {Promise<string>}
   */
  static launch(payload) {
    const timerDeviceInfo = Date.now();
    const deviceInfo = StreamingController({ apiEndpoint: payload.host }).then(
      (controller) => controller.getDeviceInfo()
    );

    return deviceInfo
      .then((deviceInfo) => {
        console.log(
          "[TIME-REPORT] DEVICE_INFO_REQ:",
          (Date.now() - timerDeviceInfo) / 1000 + "s"
        );
        console.log("[DEVICE-INFO]", JSON.stringify(deviceInfo));
        const jwtHeader = {
          alg: "RS256",
          typ: "JWT",
        };

        let jwtPayload = {
          iss: payload.issuer,
          exp: Math.round(Date.now() / 1000),
          deviceInfo: deviceInfo,
          store: payload.store,
          userId: payload.user,
          appId: parseInt(payload.appId),
        };

        if (payload.edgeNodeMode === LauncherEdgeNode.EDGE_NODE_MODE_SNAPSHOT) {
          jwtPayload = {
            ...jwtPayload,
            appId: parseInt(payload.appId),
            gameMomentId: payload.gameMomentId || undefined,
            gameSnapshotId: payload.gameSnapshotId || undefined,
            continueGame: payload.continueGame,
            userId: payload.user,
            store: payload.store,
            region: payload.region !== "" ? payload.region : undefined,
            screenSize:
              payload.screenSize !== "" ? payload.screenSize : undefined,
            gameSessionSource: payload.gameSessionSource,
            deviceInfo: payload.deviceInfo,
            extra: {
              latitude:
                payload.extra.latitude !== undefined
                  ? Number(payload.extra.latitude)
                  : undefined,
              longitude:
                payload.extra.longitude !== undefined
                  ? Number(payload.extra.longitude)
                  : undefined,
            },
          };
        } else if (
          payload.edgeNodeMode === LauncherEdgeNode.EDGE_NODE_MODE_BASE_IMAGE
        ) {
          jwtPayload = {
            ...jwtPayload,
            title: payload.title || undefined,
            edgeNodeMode: payload.edgeNodeMode,
            avdConfig: payload.avdConfig,
            emulatorVersion: payload.emulatorVersion,
            gameSessionSource: payload.gameSessionSource,
          };
        } else if (
          payload.edgeNodeMode === LauncherEdgeNode.EDGE_NODE_MODE_APK_IMAGE &&
          parseInt(payload.updateAppId) !== 0
        ) {
          jwtPayload = {
            ...jwtPayload,
            appId: parseInt(payload.updateAppId),
            backupUri: payload.backupUri,
            edgeNodeMode: payload.edgeNodeMode,
            userId: uuid(),
            baseImageId: payload.baseImageId,
            store: payload.store,
            gameSessionSource: payload.gameSessionSource,
          };
        } else if (
          payload.edgeNodeMode === LauncherEdgeNode.EDGE_NODE_MODE_APK_IMAGE &&
          parseInt(payload.updateAppId) === 0
        ) {
          jwtPayload = {
            ...jwtPayload,
            appId: parseInt(payload.appId),
            backupUri: payload.backupUri,
            packageName: payload.apkPackageName || undefined,
            title: payload.title || undefined,
            apkImageUri: payload.apkImageUri,
            edgeNodeMode: payload.edgeNodeMode,
            userId: uuid(),
            baseImageId: payload.baseImageId,
            store: payload.store,
            gameSessionSource: payload.gameSessionSource,
          };
        }
        const token = JWS.sign(
          jwtHeader.alg,
          jwtHeader,
          jwtPayload,
          payload.key
        );
        const requestUrl = `${payload.host}/api/streaming-games/create?token=${token}`;
        const timerCreateRequest = Date.now();

        return axios.get(requestUrl).then((res) => {
          console.log(
            "[TIME-REPORT] CREATE_REQ:",
            (Date.now() - timerCreateRequest) / 1000 + "s"
          );
          return res.data.edgeNodeId;
        });
      })
      .catch((err) => {
        alert("Unexpected on launch edge node, see console for more details");
        console.error(err);
        return undefined;
      });
  }

  /**
   *
   * @param {Object} payload
   * @param {string} payload.host
   * @param {string} payload.issuer
   * @param {string} payload.key
   * @param {string} payload.appId
   * @param {string} payload.gameSnapshotId
   * @param {string} payload.mandatoryRegion
   * @returns {Promise<string>}
   */
  static launchActiveMonitoring(payload) {
    console.log("launchActiveMonitoring", payload);
    const jwtHeader = {
      alg: "RS256",
      typ: "JWT",
    };

    const jwtPayload = {
      iss: payload.issuer,
      exp: Math.round(Date.now() / 1000),
      appId: parseInt(payload.appId),
      region: payload.mandatoryRegion,
      gameSnapshotId: payload.gameSnapshotId,
    };

    const token = JWS.sign(jwtHeader.alg, jwtHeader, jwtPayload, payload.key);
    const requestUrl = `${payload.host}/api/streaming-games/active-monitoring/launch?token=${token}`;

    return axios
      .get(requestUrl)
      .then((res) => res.data.activeMonitoringSessionId);
  }
}

export default LauncherEdgeNode;
