import { User } from '@schemas/User';
import { UserAuth } from '@schemas/UserAuth';
import UserService from '@services/UserService';
import { NotFound, Unauthorized } from '@utils/ErrorHandler';
import * as admin from 'firebase-admin';
import firebase from 'firebase';

jest.mock('firebase-admin');
jest.mock('firebase');

describe('Test User Service', () => {
	const mockFirestoreProperty = (admin: any) => {
		const firestore = jest.fn();
		Object.defineProperty(admin, 'firestore', {
			get: jest.fn(() => firestore),
			configurable: true,
		});
	};

	const mockAuthProperty = (admin: any) => {
		const auth = jest.fn();
		Object.defineProperty(admin, 'auth', {
			get: jest.fn(() => auth),
			configurable: true,
		});
	};

	test('should return a user Id for createUser', async () => {
		const userService = new UserService();
		mockFirestoreProperty(admin);

		const user = {
			email: 'generic@generic.com.br',
			userAuthId: '123-456-78945-68',
			lastName: 'generic',
			name: 'Generic',
			cpf: '88888888888',
			cep: '47800000',
			adress: 'generic adress',
		} as User;

		const add = jest.fn().mockReturnValue({ id: 'b1ceeda8' });
		const collection = jest.fn(() => ({ add }));
		jest.spyOn(admin, 'firestore').mockReturnValue(({
			collection,
		} as unknown) as any);

		const id = await userService.createUser(user);
		expect(id).toBe('b1ceeda8');
	});

	test('should return a user Id for createUserAuth', async () => {
		mockAuthProperty(admin);
		const userService = new UserService();

		const user = {
			email: 'generic@generic.com.br',
			password: '123456789',
			lastName: 'generic',
			name: 'Generic',
			cpf: '88888888888',
			cep: '47800000',
			adress: 'generic adress',
		} as UserAuth;

		const createUser = jest.fn().mockReturnValue({ uid: 'b1ceeda8' });
		jest.spyOn(admin, 'auth').mockReturnValue(({
			createUser,
		} as unknown) as any);

		const id = await userService.createUserAuth(user);
		expect(id).toBe('b1ceeda8');
	});

	test('should return a Error for createUserAuth', async () => {
		mockAuthProperty(admin);
		const userService = new UserService();

		const user = {
			email: 'generic@generic.com.br',
			password: '123456789',
			lastName: 'generic',
			name: 'Generic',
			cpf: '88888888888',
			cep: '47800000',
			adress: 'generic adress',
		} as UserAuth;

		const createUser = jest.fn().mockImplementation(() => {
			throw new Error();
		});
		jest.spyOn(admin, 'auth').mockReturnValue(({
			createUser,
		} as unknown) as any);

		expect(userService.createUserAuth(user)).rejects.toThrow();
	});

	test('should return a Error for createUser', async () => {
		mockFirestoreProperty(admin);
		const userService = new UserService();

		const user = {
			email: 'generic@generic.com.br',
			userAuthId: '123-456-78945-68',
			lastName: 'generic',
			name: 'Generic',
			cpf: '88888888888',
			cep: '47800000',
			adress: 'generic adress',
		} as User;

		const add = jest.fn().mockImplementation(() => {
			throw new Error();
		});
		const collection = jest.fn(() => ({ add }));
		jest.spyOn(admin, 'firestore').mockReturnValue(({
			collection,
		} as unknown) as any);

		expect(userService.createUser(user)).rejects.toThrow();
	});

	test('should return User id getting by email', async () => {
		mockAuthProperty(admin);
		const userService = new UserService();

		const getUserByEmail = jest.fn().mockReturnValue({ uid: 'b1ceeda8' });
		jest.spyOn(admin, 'auth').mockReturnValue(({
			getUserByEmail,
		} as unknown) as any);

		const id = await userService.getUserAuthInstanceByEmail(
			'generic@generic.com',
		);
		expect(id).toBe('b1ceeda8');
	});

	test('should return Error getting id by email', async () => {
		mockAuthProperty(admin);
		const userService = new UserService();
		const getUserByEmail = jest.fn().mockImplementation(() => {
			throw new NotFound('');
		});

		jest.spyOn(admin, 'auth').mockReturnValue(({
			getUserByEmail,
		} as unknown) as any);

		expect(
			userService.getUserAuthInstanceByEmail('generic@generic.com'),
		).rejects.toThrow();
	});

	test('should return userId after authorization', async () => {
		mockAuthProperty(admin);
		const userService = new UserService();

		const verifyIdToken = jest.fn().mockReturnValue({ uid: 'b1ceeda8' });
		jest.spyOn(admin, 'auth').mockReturnValue(({
			verifyIdToken,
		} as unknown) as any);

		const id = await userService.authorization('jwt Token');
		expect(id).toBe('b1ceeda8');
	});

	test('should return Error after authorization', async () => {
		mockAuthProperty(admin);
		const userService = new UserService();

		const verifyIdToken = jest.fn().mockImplementation(() => {
			throw new Unauthorized('');
		});

		jest.spyOn(admin, 'auth').mockReturnValue(({
			verifyIdToken,
		} as unknown) as any);

		expect(userService.authorization('jwt Token')).rejects.toThrow();
	});
});
