const fetch = require('node-fetch');

/**
 * @typedef {{state: {},
 * config: {},
 * capabilities: {},
 * swupdate: {},
 * name: String,
 * type: String,
 * modelid: String,
 * manufacturername: String,
 * swversion: String,
 * uniqueid: String
 * }} Sensor
 */

/**
 * @typedef {{
 * state: {
 *   on: Boolean,
 *   bri: Number,
 *   hue: Number,
 *   sat: Number,
 *   xy: Number[],
 *   ct: Number,
 *   alert: String,
 *   colormode: String,
 *   mode: String,
 *   reachable: Boolean
 * },
 * swupdate: {},
 * type: String,
 * name: String,
 * modelid: String,
 * manufacturername: String,
 * productname: String,
 * capabilities: {},
 * config: {},
 * uniqueid: String,
 * swversion: String,
 * swconfigid: String,
 * productid: String
 * }} Light
 */

/**
 * @typedef {{
 * 	on: Boolean,
 *  bri: Number,
 *  hue: Number,
 *  sat: Number,
 *  xy: Number[],
 *  ct: Number,
 *  alert: String,
 *  effect: String,
 *  transitiontime: Number,
 *  bri_inc: Number,
 *  sat_inc: Number,
 *  hue_inc: Number,
 *  ct_inc: Number,
 *  xy_inc: Number[]
 * }} NewLightState
 * 
 */

const hue = (API_ROOT = 'https://api.meethue.com') => {
	/**
	 * @param {string} accessToken
	 * @param {string} url
	 * @returns {Promise<any>}
	 */
	const getJson = (accessToken, url) => fetch(API_ROOT + url, {
		headers: {
			'Authorization': 'Bearer ' + accessToken,
			'Content-Type': 'application/json'
		}
	}).then(res => res.json());

	return {
		oauth2: {
			/**
			 * @param {String} clientId
			 * @param {String} appId
			 * @param {String} deviceId
			 * @param {String} deviceName
			 * @param {String} state
			 */
			getOauthLink: (clientId, appId, deviceId, deviceName, state) => API_ROOT + `/oauth2/auth?clientid=${clientId}&appid=${appId}&deviceid=${deviceId}&devicename=${deviceName}&state=${state}&response_type=code`,
			/**
			 * @param {String} clientId
			 * @param {String} clientSecret
			 * @param {String} code
			 * @returns {Promise<{access_token: String, access_token_expires_in: String, refresh_token: String, refresh_token_expires_in: String, token_type: String}>}
			 */
			getToken: (clientId, clientSecret, code) => fetch(`${API_ROOT}/oauth2/token?code=${code}&grant_type=authorization_code`, {
				method: 'POST',
				headers: { 'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}
			}).then(res => res.json())
		},
		/**
		 * @param {String} accessToken
		 */
		remote: accessToken => ({
			/**
			 * @returns {Promise<{id: String, internalipaddress: String}[]>}
			 */
			getBridges: () => getJson(accessToken, '/v2/bridges'),
			/**
			 * @param {String} bridgeId
			 * @param {String} username
			 * @returns {Promise<{lights: Object.<string, Light>, groups: {}, config: {}, schedules:{}, scenes: {}, rules: {}, sensors: Object.<string, Sensor>, resourcelinks: {}}>}
			 */
			getBridgeInformation: (bridgeId, username) => getJson(accessToken, `/v2/bridges/${bridgeId}/${username}`),
			/**
			 * @param {String} bridgeId
			 * @param {String} username
			 * @returns {Promise<Object.<string, Sensor>>}
			 */
			getSensors: (bridgeId, username) => getJson(accessToken, `/v2/bridges/${bridgeId}/${username}/sensors`),
			/**
			 * @param {String} bridgeId
			 * @param {String} username
			 * @returns {Promise<Object.<string, Light>>}
			 */
			getLights: (bridgeId, username) => getJson(accessToken, `/v2/bridges/${bridgeId}/${username}/lights`),
			/**
			 * @param {String} bridgeId
			 * @param {String} username
			 * @param {String} lightId
			 * @param {NewLightState} newState
			 * @returns {Promise}
			 */
			setLightState: (bridgeId, username, lightId, newState) => fetch(API_ROOT + `/v2/bridges/${bridgeId}/${username}/lights/${lightId}/state`, {
				method: 'PUT',
				headers: {
					'Authorization': 'Bearer ' + accessToken,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(newState)
			}).then(res => res.json())
		}),
		getJson
	};
};

module.exports = hue;

