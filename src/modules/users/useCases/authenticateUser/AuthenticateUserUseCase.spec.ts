import "reflect-metadata";

import { ICreateUserDTO } from './../createUser/ICreateUserDTO';
import { CreateUserUseCase } from './../createUser/CreateUserUseCase';
import { InMemoryUsersRepository } from './../../repositories/in-memory/InMemoryUsersRepository';
import { AuthenticateUserUseCase } from './AuthenticateUserUseCase';
import { IncorrectEmailOrPasswordError } from './IncorrectEmailOrPasswordError';

let authenticateUserUseCase: AuthenticateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Authenticate User", () => {
    beforeEach(() => {
        inMemoryUsersRepository = new InMemoryUsersRepository();
        authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    });

    it("Should be able Authenticate an User", async () => {
        const user: ICreateUserDTO = {
            name: "fulano",
            email: "email@test.com",
            password: "123"
        };
        await createUserUseCase.execute(user);

        const result = await authenticateUserUseCase.execute({
            email: user.email,
            password: user.password
        });

        expect(result).toHaveProperty("token");
    });

    it("Should not be able to Authenticate an none existent User", async () => {
        await expect(async () => {
            await authenticateUserUseCase.execute({
                email: "false@email.com.br",
                password: "123"
            });
        }
        ).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
    });

    it("Should not be able to Authenticate an incorrect password", async () => {
        await expect(async () => {
            const user = await createUserUseCase.execute({
                name: "fulano",
                email: "email@test.com",
                password: "123"
            });

            await authenticateUserUseCase.execute({
                email: user.email,
                password: "incorrect_password"
            });
        }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
    });
});