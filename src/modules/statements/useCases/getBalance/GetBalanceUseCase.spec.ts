import "reflect-metadata";
import { CreateStatementUseCase } from './../createStatement/CreateStatementUseCase';
import { GetBalanceUseCase } from './GetBalanceUseCase';
import { CreateUserUseCase } from './../../../users/useCases/createUser/CreateUserUseCase';
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { OperationType } from "../../entities/Statement";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";

let inMemoryStatementRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let getBalanceUseCase: GetBalanceUseCase;
let createStatementUseCase: CreateStatementUseCase;

describe("Get Balance Statement", () => {
    beforeEach(() => {
        inMemoryStatementRepository = new InMemoryStatementsRepository();
        inMemoryUsersRepository = new InMemoryUsersRepository();
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
        getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementRepository, inMemoryUsersRepository);
        createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementRepository);
    })

    it("Should be able get balance Statement", async () => {
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

        await createStatementUseCase.execute(statement);

        const result = await getBalanceUseCase.execute({ user_id: userCreated.id! });

        expect(result).toHaveProperty("statement");
    })

    it("Should not be able get balance Statement user none existent", async () => {
        expect(async () => {
            await getBalanceUseCase.execute({ user_id: 'fake_user_id' });
        }).rejects.toBeInstanceOf(GetBalanceError)
    })

    it("Should be able getBalance with deposite and witdraw", async () => {
        const userCreated = await createUserUseCase.execute({
            name: "fulano",
            email: "fulano@email.com",
            password: "123"
        })

        const statement: ICreateStatementDTO = {
            user_id: userCreated.id!,
            amount: 10,
            description: "test",
            type: OperationType.DEPOSIT
        }
        await createStatementUseCase.execute(statement)

        const statement2: ICreateStatementDTO = {
            user_id: userCreated.id!,
            amount: 10,
            description: "test",
            type: OperationType.WITHDRAW
        }

        await createStatementUseCase.execute(statement2)

        const balance = await getBalanceUseCase.execute({ user_id: userCreated.id! })

        expect(balance).toMatchObject({
            balance: 0
        });
    });
});