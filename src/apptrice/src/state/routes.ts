import HomeScreen from "../screens/home/HomeScreen"
import BotListScreen from '../screens/bots/BotListScreen'
import BotScreen from "../screens/singleBot/BotScreen";
import BotDetailsScreen from "../screens/singleBot/botDetails/BotDetailsScreen";
import BotEditorScreen from "../screens/singleBot/botEditor/BotEditorScreen";
import BtSettingsScreen from "../screens/backtesting/BtSettingsScreen";
import BtDetailsScreen from "../screens/backtesting/BtDetailsScreen";
import BtStatsScreen from "../screens/backtesting/btStats/BtStatsScreen";
import BtOrdersScreen from "../screens/backtesting/btOrders/BtOrdersScreen";
import BtChartsScreen from "../screens/backtesting/btCharts/BtChartsScreen";
import BtScreen from "../screens/backtesting/BtScreen";
import DeploymentsScreen from "../screens/deployments/DeploymentsScreen";
import ExchangesScreen from "../screens/exchanges/ExchangesScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
import SingleDeploymentScreen from "../screens/singleDeployment/SingleDeploymentScreen";
import DeploymentOrdersScreen from "../screens/singleDeployment/orders/DeploymentOrdersScreen";
import DeploymentStateScreen from "../screens/singleDeployment/state/DeploymentStateScreen";
import DeploymentLogsScreen from "../screens/singleDeployment/logs/DeploymentLogsScreen";
import DeploymentStatsScreen from "../screens/singleDeployment/stats/DeploymentStatsScreen";

const routes = [
	{path: '/', cb: HomeScreen},
	{path: '/deployments', cb: DeploymentsScreen, children: [
		{path: '/:id', cb: SingleDeploymentScreen, children: [
			{path: '/', cb: DeploymentStatsScreen },
			{path: '/stats', cb: DeploymentStatsScreen },
			{path: '/orders', cb: DeploymentOrdersScreen },
			{path: '/state', cb: DeploymentStateScreen},
			{path: '/logs', cb: DeploymentLogsScreen}
		]}
	]},
	{path: '/bots', cb: BotListScreen, children: [
		{path: '/:id', cb: BotScreen, children: [
			{ path: '/details', cb: BotDetailsScreen },
			{ path: '/editor', cb: BotEditorScreen },
			{ path: '*', cb: BotDetailsScreen },
		]}
	]},
	{path: '/exchanges', cb: ExchangesScreen},
	{
		path: '/backtesting/:id', cb: BtScreen, children: [
			{ path: '/settings', cb: BtSettingsScreen },
			{
				path: '/:btid', cb: BtDetailsScreen, children: [
					{ path: '/stats', cb: BtStatsScreen },
					{ path: '/orders', cb: BtOrdersScreen },
					{ path: '/charts', cb: BtChartsScreen },
					{ path: '*', cb: BtStatsScreen }
				]
			},
			{ path: '*', cb: BtSettingsScreen },
		]
	},
	{ path: '/settings', cb: SettingsScreen },
];

export default routes;