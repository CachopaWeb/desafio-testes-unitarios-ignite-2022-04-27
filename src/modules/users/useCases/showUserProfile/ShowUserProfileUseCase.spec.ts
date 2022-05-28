import "reflect-metadata"

import { ShowUserProfileUseCase } from './ShowUserProfileUseCase';
import { InMemoryUsersRepository } from './../../repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from '../createUser/CreateUserUseCase';
import { ShowUserProfileError } from "./ShowUserProfileError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Show User Profile", () => {
    beforeEach(() => {
        inMemoryUsersRepository = new InMemoryUsersRepository();
        showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    });


    it("Should be able Show User Profile", async () => {
        const userCreated = await createUserUseCase.execute({
            name: "fulano",
            email: "email@email.com.br",
            password: "123"
        });

        const user = await showUserProfileUseCase.execute(userCreated.id!);
        expect(user).toMatchObject({
            name: "fulano",
            email: "email@email.com.br",
        });
    });

    it("Should not be able Show User Profile an User none Exists", async () => {
        expect(async () => {
            await showUserProfileUseCase.execute("fake_id");
        }).rejects.toBeInstanceOf(ShowUserProfileError);
    });
});