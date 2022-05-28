import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from './../../repositories/in-memory/InMemoryUsersRepository';
import { CreateUserError } from './CreateUserError';
import { CreateUserUseCase } from './CreateUserUseCase';

let createUserUseCase: CreateUserUseCase;
let inMemoryCreateUser: InMemoryUsersRepository;

describe("Create User", () => {

    beforeEach(() => {
        inMemoryCreateUser = new InMemoryUsersRepository();
        createUserUseCase = new CreateUserUseCase(inMemoryCreateUser);
    });

    it("Should be able to create new User", async () => {
        const userCreated = await createUserUseCase.execute({
            name: "fulano",
            email: "email@email.com",
            password: "123"
        });

        expect(userCreated).toHaveProperty("id");
    });

    it("Should not be able to create new User an email existent", async () => {
        await expect(async () => {
            await createUserUseCase.execute({
                name: "fulano",
                email: "email@email.com",
                password: "123"
            });

            await createUserUseCase.execute({
                name: "fulano2",
                email: "email@email.com",
                password: "123"
            });
        }).rejects.toBeInstanceOf(CreateUserError);
    });


});