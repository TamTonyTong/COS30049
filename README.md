## Vercel Link
**__Develop branch vercel deployment domain:__** https://tradepro-git-develop-cos30049.vercel.app
## How to run our project locally

Install [Node.js](https://nodejs.org/en) if you haven't

Navigate to the Project Directory
```bash
cd path/to/project-folder
```

Install ``npm`` package

```bash
npm install
npm install ganache --global
```
Open a new terminal 
```bash
ganache --mnemonic "also spring announce response naive monitor unusual name lecture foster rose oxygen"
```
Install Metamask extension on browser. Import any private key onto Metamask account.

On Metamask, click on the Network Button.

![Image](https://github.com/user-attachments/assets/75465c57-1ad6-4f1b-b5db-0e291b98c35d)

Configure as follow. Note that the local host link should start with http://127.0.0.1:8545

![Image](https://github.com/user-attachments/assets/426af9d0-98df-47d0-bb01-7e60fa77300b)

Open a new terminal
```bash
npx hardhat run scripts/deploy.js --network ganache
```
and paste the trading contract into the const in BuyTradingClient.tsx.

Build and the development server:
```bash
npm run build
```
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

For the best experience, please use the Command Line integrated within Visual Studio Code.
