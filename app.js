import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();
app.use(express.json());
app.use(cors());


// DB
mongoose.connect('mongodb://localhost:27017/exchangeApi');

const db = mongoose.connection;
db.on('error', error => console.error(error, "\n\n", 'MongoDB unavailable'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

//Schemas
const userSchema = new mongoose.Schema({
    username: String,
    token: String
});

const transactionReceiptSchema = new mongoose.Schema({
    from: String,
    walletFrom: String,
    currency: String,
    amount: String
});

const transactionTrasferSchema = new mongoose.Schema({
    to: String,
    currency: String,
    amount: String
});

const walletSchema = new mongoose.Schema({
    owner: String,
    currency: String,
    balance: Number,
    address: String,
    transactions: {
        Receipts: [transactionReceiptSchema],
        Transfers: [transactionTrasferSchema]
    }
}, { collection: 'wallet_accounts' });

const User = mongoose.model('User', userSchema);
const Wallet = mongoose.model('Wallet', walletSchema);



// POST
app.post('/transfer', async (req, res) => {
    const { token, walletFrom, recipient, amount, currency } = req.body;

    // Token check
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json('Unauthorized. Token not found');
    }

    // Balance check
    const wallet = await Wallet.findOne({owner: user.username, address: walletFrom});
    if (!wallet) {
        return res.status(404).json('Wallet not found');
    }
    if (wallet.balance < amount) {
      return res.status(400).end('Insufficient funds');
    }

    // Recipient check
    const recipientUser = await Wallet.findOne({ owner: recipient, currency: currency });
    if (recipientUser == wallet) {
        return res.status(400).end('Вы успешно отправили средства сами себе оплатив коммиссию!');
    }
    if (!recipientUser) {
        return res.status(404).end('Recipient not found');
    }

    // Transfer
    wallet.balance -= Number(amount);
    recipientUser.balance += Number(amount);


    wallet.transactions.Transfers.push({ to: recipient.username, walletTo: recipient.address, currency, amount });
    recipientUser.transactions.Receipts.push({ from: recipient.username, walletFrom, currency, amount });

    await wallet.save();
    await recipientUser.save();

    return res.status(200).end('Transfer successful');
});

app.post('/convert', async (req, res) => {
    const { token, amount } = req.body;

    const user = await User.findOne({ token });
    if (!user) {
        return res.status(401).end('Unauthorized. Token not found');
    }

    const rates = {
        RUB: 87.91,
        UAH: 40.44,
        KZT: 477.34
    };

    const convertedAmounts = {
        RUB: (amount * rates.RUB).toFixed(2),
        UAH: (amount * rates.UAH).toFixed(2),
        KZT: (amount * rates.KZT).toFixed(2)
    };

    return res.status(200).end(`${amount} USD = ${convertedAmounts.RUB} RUB, ${convertedAmounts.UAH} UAH, ${convertedAmounts.KZT} KZT`);
});









const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
