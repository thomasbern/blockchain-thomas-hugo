# hardhat Backend

## Setup local Project

```bash
npm install --save-dev hardhat
npm install dotenv
npm install @openzeppelin/contracts

npx hardhat ignition deploy ./ignition/modules/deploy.ts --network localhost
```

## Install HardHat

```bash
npm init

nvm install 20
nvm use 20

npm install --save-dev hardhat
npx hardhat init
# select typescript

# install env lib
npm i dotenv 
# install openzeppelin
npm install @openzeppelin/contracts
npm install --save-dev @openzeppelin/test-helpers```

## Run HardHat

```bash
npx hardhat clean
npx hardhat compile
npx hardhat test

npx hardhat node

npx hardhat ignition deploy ./ignition/modules/deploy.ts --network localhost
npx hardhat run ignition/modules/deploy.ts --network localhost
```
