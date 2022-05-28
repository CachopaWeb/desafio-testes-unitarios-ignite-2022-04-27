import "reflect-metadata";

import { ICreateStatementDTO } from './../createStatement/ICreateStatementDTO';
import { CreateStatementUseCase } from './../createStatement/CreateStatementUseCase';
import { CreateUserUseCase } from './../../../users/useCases/createUser/CreateUserUseCase';
import { InMemoryUsersRepository } from './../../../users/repositories/in-memory/InMemoryUsersRepository';
import { GetStatementOperationUseCase } from './GetStatementOperationUseCase';
import { InMemoryStatementsRepository } from './../../repositories/in-memory/InMemoryStatementsRepository';
import { Statement, OperationType } from '../../entities/Statement';
import { GetStatementOperationError } from "./GetStatementOperationError";

let inMemoryStatementRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let inMemoryUserRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;


describe("Get Statement Operation", () => {
    beforeEach(() => {
        inMemoryUserRepository = new InMemoryUsersRepository();
        createUserUseCase = new CreateUserUseCase(inMemoryUserRepository);
        inMemoryStatementRepository = new InMemoryStatementsRepository();
        createStatementUseCase = new CreateStatementUseCase(inMemoryUserRepository, inMemoryStatementRepository);
        getStatementOperationUseCase = new GetStatementOperationUseCase(
            inMemoryUserRepository,
            inMemoryStatementRepository
        );
    });

    it("Should be able Get Statement Operation", async () => {
        const userCreated = await createUserUseCase.execute({
            name: "fulano",
            email: "test@email.com",
            password: "123"
        })

        const statement: ICreateStatementDTO = {
            user_id: userCreated.id!,
            amount: 10.0,
            description: "Compra",
            type: OperationType.DEPOSIT
        }

        const statementCreated: Statement = await createStatementUseCase.execute(statement);

        const statementOperation = await getStatementOperationUseCase.execute({
            user_id: userCreated.id!,
            statement_id: statementCreated.id!
        })

        expect(statementOperation).toMatchObject({
            amount: 10.0,
            description: "Compra",
            type: "deposit"
        });
    });

    it("Should not be able Get Statement Operation an User none existents", async () => {
        await expect(async () => {
            const statement: ICreateStatementDTO = {
                user_id: 'fake_id',
                amount: 10.0,
                description: "Compra",
                type: OperationType.DEPOSIT
            }

            await getStatementOperationUseCase.execute({ user_id: "fake_id", statement_id: "123" });
        }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
    })

    it("Should not be able Get Statement Operation an User none existents", async () => {
        await expect(async () => {
            const userCreated = await createUserUseCase.execute({
                name: "fulano",
                email: "test@email.com",
                password: "123"
            })

            await getStatementOperationUseCase.execute({ user_id: userCreated.id!, statement_id: "fake_id" });
        }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
    })
})