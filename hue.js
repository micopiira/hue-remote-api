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

	const getHeaders = accessToken => (remote ? {
		'Authorization': 'Bearer ' + accessToken,
		'Content-Type': 'application/json'
	} : {'Content-Type': 'application/json'});

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
		bridgeDiscovery: {
			/**
			 * Depending on the firmware release of the Hue bridge the amount of information per Hue bridge can be different, e.g. the second Hue bridge in the reply above, it does not contain the “macaddress” and “name” items. 
			 * In case of an empty JSON array reply (i.e. [ ]), no Hue bridge has been found. This can be because the user never connected the bridge to the Internet or it has been considered to be disconnected, in that case an option is to perform an “IP scan”, or ask the user to enter an IP address of the Hue bridge.
			 * Best practice is to wait a maximum of 8 seconds for receiving the N-UPnP repsonse back from the Hue portal before continuing.
			 * 
			 * @returns {Promise<{id: String, internalipaddress: String, macaddress: String, name: String}[]>}
			 */
			nupnpScan: () => fetch('https://discovery.meethue.com/').then(res => res.json())
		},
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
			getBridges: () => call('/v2/bridges', {headers: getHeaders(accessToken)}),
			/**
			 * @param {String} bridgeId
			 * @param {String} username
			 * @returns {Promise<{lights: Object.<string, Light>, groups: {}, config: {}, schedules:{}, scenes: {}, rules: {}, sensors: Object.<string, Sensor>, resourcelinks: {}}>}
			 */
			getBridgeInformation: ({bridgeId, username}) => call(`/v2/bridges/${bridgeId}/${username}`, {headers: getHeaders(accessToken)}),

		}),
		api: ({accessToken, bridgeId, username}) => {
			const request = (path, opts) => getJson({accessToken, bridgeId, username, path}, opts);
			return {
				request,
				/**
				 * @returns {Promise<Object.<string, Sensor>>}
				 */
				getSensors: () => request('/sensors'),
				/**
				 * @returns {Promise<Object.<string, Light>>}
				 */
				getLights: () => request('/lights'),
				getGroups: () => request('/groups'),
				getSchedules: () => request('/schedules'),
				getScenes: () => request('/scenes'),
				getRules: () => request('/rules'),
				getResourcelinks: () => request('/resourcelinks'),
				getCapabilities: () => request('/capabilities'),
				/**
				 * @param {NewLightState} newState
				 * @returns {Promise}
				 */
				setLightState: ({lightId, newState}) => request(`/lights/${lightId}/state`, {
					method: 'PUT',
					body: JSON.stringify(newState)
				})
			}
		},
		getJson,
		call
	};
};

module.exports = hue;

