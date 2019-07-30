const fetch = require('node-fetch');

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
			 */
			getBridgeInformation: (bridgeId, username) => getJson(accessToken, `/v2/bridges/${bridgeId}/${username}`),
			/**
			 * @param {String} bridgeId
			 * @param {String} username
			 */
			getSensors: (bridgeId, username) => getJson(accessToken, `/v2/bridges/${bridgeId}/${username}/sensors`)
		}),
		getJson
	};
};

module.exports = hue;