import AccountModel from '../_common/dynamo/AccountModel';
import ExchangeAccountModel from '../_common/dynamo/ExchangeAccountModel';
import BotDeploymentModel from '../_common/dynamo/BotDeploymentModel';
import BotModel from '../_common/dynamo/BotModel';
import lambdaUtil from '../_common/utils/lambda';
import BitfinexAdapter from '../_common/exchanges/adapters/BitfinexAdapter';
import exchangeUtils from '../_common/exchanges/exchangeUtils';
import deploymentAPI from './deployments/deploymentsAPI';
import allModels from '../_common/dynamo/allModels';
import exchangesAPI from './exchangeAccounts/exchangesAPI';
import botsAPI from './bots/botsAPI';

const fs = require('fs');
const path = require('path');

const serverless = require('serverless-http');
const express = require('express')
const app = express()

app.use(express.json());

app.get('/', function (req, res) {
	console.log('Hello!');
	res.send('Hello World!')
});

app.get('/accounts/:id', function(req, res){
	res.send('/account/:id not implemented yet');
});

botsAPI.initialize(app);
deploymentAPI.initialize(app);
exchangesAPI.initialize(app);

app.post('/runnow', function(req, res) {
	const { accountId, deploymentId } = req.body;
	if (!accountId) return returnMissingAttr(res, 'accountId');
	if (!deploymentId) return returnMissingAttr(res, 'deploymentId');

	console.log('getting deployment');
	BotDeploymentModel.getSingle(accountId, deploymentId)
		.then( deployment => {
			if (!deployment ){
				return res.status(404)
					.json({error: 'not_found'})
				;
			}
			
			console.log('deployment found');

			lambdaUtil.invokeSupplierdo({accountId, deploymentId})
				.then(result => {
					console.log(result);
					res.status(200).end();
				})
			;
		})
	;
})

app.get('/candles', async function(req,res) {
	const { symbol, runInterval, startDate, endDate, exchange = 'bitfinex' } = req.query;
	const adapter = new BitfinexAdapter({key: 'candles', secret: 'candles'});

	const lastCandleAt = exchangeUtils.getLastCandleAt(runInterval, endDate);
	const candleCount = getCandleCount(startDate, endDate, runInterval );
	const options = {
		market: symbol,
		runInterval,
		candleCount,
		lastCandleAt
	};

	console.log( options );

	const candles = await adapter.getCandles(options);

	res.json(candles);
});

export const apitron = serverless(app);

function getCandleCount( startDate, endDate, runInterval ){
	let length = endDate - startDate;
	return Math.ceil( length / exchangeUtils.runIntervalTime[runInterval] );
}

async function setTestData(event) {
	let { accountId } = event;
	let account = await AccountModel.getSingle(accountId);
	if (!account) {
		console.log('Creating test data');
		await AccountModel.create({
			id: accountId
		});

		await ExchangeAccountModel.create({
			accountId,
			id: 'testExchange',
			provider: 'bitfinex',
			type: 'real',
			key: 'Mma7B6ISTUNVcnUPOrDJgVgcNRh3VbmeIalaBDvUpml',
			secret: 'U2FsdGVkX18urwMNykZfeGeUbn4cGGgWgI7uGl3/qzeexDPcmUQX6cEAr9s5bcKe5wUhIKfwiysejvfD9h5lJw=='
		});

		await ExchangeAccountModel.create({
			accountId,
			id: 'virtualExchange',
			provider: 'bitfinex',
			type: 'virtual',
			key: '{"BTC": {"asset": "BTC", "free": 0, "total": 0}, "USD": {"asset": "USD", "free": 1000, "total": 1000}}',
			secret: '{}'
		});

		await BotDeploymentModel.create({
			accountId,
			id: 'testDeployment',
			botId: 'testBot',
			orders: {
				foreignIdIndex: {},
				items: {}
			},
			exchangeAccountId: 'virtualExchange',
			runInterval: '1h',
			symbols: ['BTC/USD', 'ETH/USD'],
			state: {},
			active: 'true'
		});

		await BotModel.create({
			name: 'Test bot',
			accountId,
			id: 'testBot',
			code: fs.readFileSync(path.join(__dirname, '../../../bots/testBot.ts'), 'utf8')
		});
	}
	else {
		console.log('Test data was already there');
	}
}

setTestData({accountId: 'testAccount'});


function returnMissingAttr( res, attrName ){
	res.status(400)
		.json({ error: 'invalid_payload', message: `${attrName} not given` })
	;
}