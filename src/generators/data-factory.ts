import { faker } from '@faker-js/faker/locale/ru';

export class DataFactory {
    
    /**
     * Генерирует модель пользователя
     */
    static generateUserModel() {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const postfix = Math.random().toString(36).substring(2, 5);

        return {
            firstName: firstName,
            lastName: lastName,
            description: `${lastName} ${firstName}`,
            login: `${lastName}${postfix}`.replace(/\./g, '_'),
            mail: faker.internet.email({ firstName: lastName, lastName: firstName }),
            phone: faker.helpers.replaceSymbols('+79#########'),
            personnelNumber: faker.helpers.replaceSymbols('####'),
            isDisabled: false,
            isLeader: false,
            language: "ru"
        };
    }

    /**
     * Генерирует модель контрагента
     */
    static generateCounterpartyModel() {
        const brandName = faker.company.name();

        return {
            inn: faker.helpers.replaceSymbols('##########'),
            kpp: faker.helpers.replaceSymbols('#########'),
            ogrn: faker.helpers.replaceSymbols('#############'),
            shortTitle: brandName,
            fullTitle: `ООО ${brandName}`,
            address: faker.location.streetAddress({ useFullAddress: true }),
            phone: faker.helpers.replaceSymbols('+7 (812) ###-##-##'),
            email: faker.internet.email(),
            type: "LEGALENTITY_DEF"
        };
    }

    /**
     * Генерирует модель проекта
     */
    static generateProjectModel() {
        const projectName = faker.company.catchPhrase();
        return {
            code: faker.helpers.replaceSymbols('PRJ-####'),
            title: projectName,
            projectsObject: projectName
        };
    }

    /**
     * Генерирует модель входящего документа
     */
    static generateIncomeDocumentModel(senderHandle: string) {
        return {
            title: faker.lorem.sentence(3),
            content: `<p dir="ltr"><span style="white-space: pre-wrap;">${faker.lorem.paragraph()}</span></p>`,
            documentType: {
                sysId: "NODE_ORD_DOCUMENTTYPE_MESSAGE"
            },
            sender: {
                handle: senderHandle
            },
            appendicesCount: 0,
            listCount: 0,
            sheetOfAppendicesCount: 0,
            finishDate: "",
            sendingDate: "",
            senderNumber: "",
            projects: [],
            againTo: null,
            executor: null,
            inResponseTo: null,
            signer: null
        };
    }

    /**
     * Генерирует модель подразделения (Department)
     */
    static generateDepartmentModel() {
        const departmentName = faker.commerce.department();
        const code = departmentName
            .split(' ')
            .map((word: string) => word[0])
            .join('')
            .toUpperCase();
        
        return {
            description: departmentName,
            code: code
        };
    }

    /**
     * Генерирует модель группы пользователей
     */
    static generateGroupModel(memberHandle: string) {
        return {
            title: `Группа ${faker.commerce.department()}`,
            isAdmin: false,
            isArchive: false,
            isContractEditor: false,
            isFormByDomainGroup: false,
            isGip: false,
            isORDEditor: false,
            users: [
                {
                    member: {
                        handle: memberHandle
                    }
                }
            ]
        };
    }

    /**
     * Генерирует модель договора
     */
    static generateContractModel(counterpartyHandle: string) {
        const now = new Date();
        const finish = new Date();
        finish.setMonth(now.getMonth() + 6);

        const formatDate = (date: Date) => date.toDateString();

        return {
            subject: faker.lorem.sentence(3),
            documentType: {
                sysId: "NODE_CONTRACTTYPE_MUNICIPAL"
            },
            startDate: formatDate(now),
            finishDate: formatDate(finish),
            party1: { handle: counterpartyHandle },
            party1Name: null,
            party2: { handle: counterpartyHandle },
            party2Name: "",
            price: "",
            priceNDS: "",
            fullPrice: "",
            stages: []
        };
    }
}