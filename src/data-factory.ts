import { fakerRU as faker } from '@faker-js/faker';

export const DataFactory = {
    generateIncomeDocument(senderHandle: string) {
        const description = faker.lorem.paragraph();
        
        return {
            title: faker.lorem.sentence({ min: 3, max: 5 }),
            content: `<p dir="ltr"><span style="white-space: pre-wrap;">${description}</span></p>`,
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
};