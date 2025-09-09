import endpoint from './endpoints';
import { jwtDecode } from "jwt-decode";
import StreamlitUtil from "./streamlitUtil";

async function request(url, payload, method, authToken) {
	const headers = { "Content-Type": "application/json" };
	if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

	return fetch(endpoint + url, {
		method,
		mode: "cors",
		cache: "no-cache",
		credentials: "same-origin",
		headers,
		redirect: "follow",
		referrerPolicy: "no-referrer",
		body: JSON.stringify(payload),
	});
}

async function refreshToken() {
	const refresh_token = localStorage.getItem("rf_token");
	if (!refresh_token) {
		throw new Error("No refresh token found. Please log in again.");
	}

	const res = await fetch(
		`${endpoint}auth/refresh?refresh_token=${encodeURIComponent(
			refresh_token
		)}`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			//body: JSON.stringify({ refresh_token:refresh_token }),
		}
	);

	const data = await res.json();

	// if (data?.status_code === 200 && data?.data?.access_token) {
	if ( data && data.status_code === 200 && data.data && data.data.access_token ) {
		let token = data.data.access_token;
		localStorage.setItem("token", token);
		localStorage.setItem("rf_token", data.data.refresh_token);
		const expired = jwtDecode(token)?.exp || 0;
		localStorage.setItem("expired", expired.toString());
		// console.log("========:Token Refreshed:==========")
		//send back to streamlit
		StreamlitUtil.send({ 
			status: "OK", 
			message: "Token_Refreshed", 
			data: {
				access_token: token,
				refresh_token: data.data.refresh_token,
				expires_at: expired
				}
		});
		return data.data.access_token;
	}
	throw new Error('Failed to refresh token. Please log in again.');
}

export async function APIClient(url, payload, fetchmethod, token = "") {
	//Check Expiration
	const expire_time = parseInt(localStorage.getItem("expired"));
	//const last_request = parseInt(localStorage.getItem("last_request"));
	const now = Math.floor(Date.now() / 1000); // Current time in seconds
	const tokenNearExpiryOrExpired = expire_time - now < 0; // Token is near expiry (28 minutes) or expired

	if (tokenNearExpiryOrExpired) {
		token = await refreshToken();
	}

	let res = await request(url, payload, fetchmethod, token);
	let data = await res.json();

	if (data?.detail === 'Could not validate credentials') {
		token = await refreshToken();
		res = await request(url, payload, fetchmethod, token);
		data = await res.json(); // parse new response safely
	}
	return data;
}
