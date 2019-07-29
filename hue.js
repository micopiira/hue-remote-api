const fetch = require('node-fetch');

const getJson = (accessToken, url) => fetch(API_ROOT + url, {
	headers: {
		'Authorization': 'Bearer ' + accessToken,
		'Content-Type': 'application/json'
	}
}).then(res => res.json());

const hue = (API_ROOT ='https://api.meethue.com') = ({
	oauth2: {
		getOauthLink: (clientId, appId, deviceId, deviceName, state) => API_ROOT + `/oauth2/auth?clientid=${clientId}&appid=${appId}&deviceid=${deviceId}&devicename=${deviceName}&state=${state}&response_type=code`,
		getToken: (clientId, clientSecret, code) => fetch(`${API_ROOT}/oauth2/token?code=${code}&grant_type=authorization_code`, {
			method: 'POST',
			headers: { 'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}
		}).then(res => res.json())
	},
	remote: accessToken => ({
		getBridges: () => getJson(accessToken, '/v2/bridges'),
		getBridgeInformation: (bridgeId, username) => getJson(accessToken, `/v2/bridges/${bridgeId}/${username}`),
		getSensors: (bridgeId, username) => getJson(accessToken, `/v2/bridges/${bridgeId}/${username}/sensors`)
	}),
	getJson
});

module.exports = hue;