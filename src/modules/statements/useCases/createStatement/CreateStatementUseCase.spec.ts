import "reflect-metadata";

import { GetBalanceUseCase } from './../getBalance/GetBalanceUseCase';
import { CreateUserUseCase } from './../../../users/useCases/createUser/CreateUserUseCase';
import { InMemoryStatementsRepository } from './../../repositories/in-memory/InMemoryStatementsRepository';
import { InMemoryUsersRepository } from './../../../users/repositories/in-memory/InMemoryUsersRepository';
import { CreateStatementUseCase } from './CreateStatementUseCase';
import { ICreateStatementDTO } from './ICreateStatementDTO';
import { OperationType } from '../../entities/Statement';
import { CreateStatementError } from './CreateStatementError';

let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe("Create Statement", () => {
    beforeEach(() => {
        inMemoryUsersRepository = new InMemoryUsersRepository();
        inMemoryStatementsRepository = new InMemoryStatementsRepository();
        createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
        getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);
    })

    it("Should be able create Statement", async () => {
        const userCreated = await createUserUseCase.execute({
            name: "fulano",
            email: "fulano@email.com",
            password: "123"
        })

        const statement: ICreateStatementDTO = {
            user_id: userCreated.id!,
            amount: 10.0,
            description: "test",
            type: OperationType.DEPOSIT
        }

        const result = await createStatementUseCase.execute(statement)

        expect(result).toHaveProperty('amount')
    });

    it("Should not be able create Statement an user none existent", async () => {
        await expect(async () => {
            const statement: ICreateStatementDTO = {
                user_id: 'fake_user_id',
                amount: 10.0,
                description: "test",
                type: OperationType.DEPOSIT
            }

            await createStatementUseCase.execute(statement)
        }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
    });

    it("Should not be able create Statement an withdraw with balance < amount", async () => {
        await expect(async () => {
            const userCreated = await createUserUseCase.execute({
                name: "fulano",
                email: "fulano@email.com",
                password: "123"
            })

            const statement: ICreateStatementDTO = {
                user_id: userCreated.id!,
                amount: 10,
                description: "test",
                type: OperationType.WITHDRAW
            }
            await createStatementUseCase.execute(statement)

        }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
    });
});