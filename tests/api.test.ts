import { baseURL } from '../src/services/api';

import axios from 'axios';
import moment from 'moment';

describe('API Testing', () => {
	test('getListSharingSuccess', async () => {
		const response = await axios.get(`${baseURL}/sharings`, {
			params: { filter: { limit: 5 } },
		});
		expect(response.status).toBe(200);
		//  Check response.data has property "data" or not ?
		expect(response.data).toHaveProperty('data');
		//  Check response.data has property "count" or not ?
		expect(response.data).toHaveProperty('count');
	});
	test('loginSuccess', async () => {
		const response = await axios.post(`${baseURL}/login`, {
			email: 'tuanpha.it@gmail.com',
			password: 'admin@123',
		});
		expect(response.status).toBe(200);
		// Check response.data has property "token" or not ?
		expect(response.data).toHaveProperty('token');
	});
	test('registerFail', async () => {
		try {
			await axios.post(`${baseURL}/register`, {
				email: 'tuanpha.it@gmail.com',
				password: 'admin@123',
			});
		} catch (error: any) {
			expect(error.response.status).toBe(500);
			expect(error.response.data.error.message).toBe(
				'duplicate key value violates unique constraint "uniqueEmail"'
			);
		}
	});
	test('loginFail', async () => {
		try {
			await axios.post(`${baseURL}/login`, {
				email: 'tuanpha.it1@gmail.com',
				password: 'admin@123',
			});
		} catch (error: any) {
			expect(error.response.status).toBe(401);
			expect(error.response.data.error.message).toBe(
				'Invalid email or password.'
			);
		}
	});
	test('registerSuccess', async () => {
		try {
			const response = await axios.post(`${baseURL}/register`, {
				email: `tuanpha.it${moment().format('x')}@gmail.com`,
				password: 'admin@123',
			});
			expect(response.status).toBe(200);
			expect(response.data).toHaveProperty('token');
		} catch (error: any) {}
	});
	test('getProfileSuccess', async () => {
		try {
			const res1 = await axios.post(`${baseURL}/login`, {
				email: 'tuanpha.it@gmail.com',
				password: 'admin@123',
			});

			const token = res1.data.token;
			const res2 = await axios.get(`${baseURL}/users/me`, {
				headers: {
					authorization: 'Bearer ' + token,
				},
			});
			expect(res2.status).toBe(200);
			expect(res2.data).toHaveProperty('email');
		} catch (error: any) {}
	});
	test('createSharingSuccess', async () => {
		try {
			// login get token
			const res1 = await axios.post(`${baseURL}/login`, {
				email: 'tuanpha.it@gmail.com',
				password: 'admin@123',
			});

			const token = res1.data.token;
			const url = 'https://www.youtube.com/watch?v=qgb-bdEEI-M&t=65s';

			// get url's metadata
			const res2 = await axios.get(
				`https://remitano-web-gamma.vercel.app/api/get-preview-link?link=${url}`
			);

			expect(res2.status).toBe(200);
			expect(res2.data).toHaveProperty('title');

			// create a sharing url
			const res3 = await axios.post(
				`${baseURL}/sharings`,
				{
					videoUrl: url,
					title: res2.data.title,
					description: res2.data.description,
					cover: res2.data.metadata?.images?.[0],
				},
				{
					headers: {
						authorization: 'Bearer ' + token,
					},
				}
			);
			expect(res3.status).toBe(200);
			expect(res3.data).toHaveProperty('id');

			// delete newly created sharing
			const res4 = await axios.delete(
				`${baseURL}/sharings/${res3.data.id}`,
				{
					headers: {
						authorization: 'Bearer ' + token,
					},
				}
			);

			expect(res4.status).toBe(204);
		} catch (error: any) {}
	});
});
