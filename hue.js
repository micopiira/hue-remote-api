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

const hue = (API_ROOT = 'https://api.meethue.com', remote = true) => {

	const getHeaders = accessToken => ({
		'Authorization': 'Bearer ' + accessToken,
		'Content-Type': 'application/json'
	});

	const urlPrefix = (username, bridgeId) => remote ? `/v2/bridges/${bridgeId}/${username}` : `/api/${username}`;

	/**
	 * @returns {Promise}
	 */
	const call = (path, opts) => fetch(API_ROOT + path, opts).then(res => res.json());

	const getJson = ({accessToken, path, bridgeId, username}, opts) => call(urlPrefix(username, bridgeId) + path, {
		headers: getHeaders(accessToken),
		...opts
	});

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
			getBridges: () => getJson({accessToken}, '/v2/bridges'),
			/**
			 * @param {String} bridgeId
			 * @param {String} username
			 * @returns {Promise<{lights: Object.<string, Light>, groups: {}, config: {}, schedules:{}, scenes: {}, rules: {}, sensors: Object.<string, Sensor>, resourcelinks: {}}>}
			 */
			getBridgeInformation: ({bridgeId, username}) => getJson(accessToken, `/v2/bridges/${bridgeId}/${username}`),

		}),
		api: ({accessToken, bridgeId, username}) => ({
			/**
			 * @returns {Promise<Object.<string, Sensor>>}
			 */
			getSensors: () => getJson({accessToken, bridgeId, username, path: '/sensors'}),
			/**
			 * @returns {Promise<Object.<string, Light>>}
			 */
			getLights: () => getJson({accessToken, bridgeId, username, path: '/lights'}),
			/**
			 * @param {NewLightState} newState
			 * @returns {Promise}
			 */
			setLightState: ({lightId, newState}) => getJson({accessToken, bridgeId, username, path: `/lights/${lightId}/state`}, {
				method: 'PUT',
				body: JSON.stringify(newState)
			})
		}),
		getJson,
		call
	};
};

module.exports = hue;

