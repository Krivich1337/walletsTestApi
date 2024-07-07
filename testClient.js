import axios from 'axios';
import inquirer from 'inquirer';

const actions = ['Перевод средств USDT', 'Конвертация'];

inquirer.prompt([
    {
        type: 'list',
        name: 'action',
        message: 'Какое действие выполнить?',
        choices: actions,
    },
]).then(async (answers) => {
    // Transfer USDT
    if (answers.action === actions[0]) {
        const transferParams = await inquirer.prompt([
            {
                type: 'input',
                name: 'token',
                message: 'Ваш токен:',
            },
            {
                type: 'input',
                name: 'walletFrom',
                message: 'Кошелёк для списания:',
            },
            {
                type: 'input',
                name: 'recipient',
                message: 'Юзернейм получателя:',
            },
            {
                type: 'input',
                name: 'amount',
                message: 'Сумма перевода:',
            }
        ]);

        const { token, walletFrom, recipient, amount } = transferParams;
        Number(amount);
        const response = await axios.post('http://localhost:3000/transfer', {
            token,
            walletFrom,
            recipient,
            amount,
            currency: 'USDT',
        });
        console.log(response.data);
    // Convert USD
    } else if (answers.action === actions[1]) {
        const conversionParams = await inquirer.prompt([
            {
                type: 'input',
                name: 'token',
                message: 'Введите token:',
            },
            {
                type: 'input',
                name: 'amount',
                message: 'Введите сумму конвертации:',
            },
        ]);

        const { token, amount } = conversionParams;
        const response = await axios.post('http://localhost:3000/convert', {
            token,
            amount,
        });
        console.log(response.data);
    }
});
