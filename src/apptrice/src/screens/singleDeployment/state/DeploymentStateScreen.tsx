import * as React from 'react'
import { Orders } from '../../../../../lambdas/lambda.types';
import { DBBotDeployment } from '../../../../../lambdas/model.types';
import OrderList from '../../../common/orderList/OrderList';
import { Card, ScreenWrapper } from '../../../components';
import { ScreenProps } from '../../../types';
import deploymentLoader from '../deployment.loader';
import styles from './_DeploymentStateScreen.module.css';

export default class DeploymentStateScreen extends React.Component<ScreenProps> {
	render() {
		let { data: deployment } = deploymentLoader.getData(this.getDeploymentId())
		let orders = this.getOrders(deployment);
		return (
			<ScreenWrapper title="state data">
				{ this.renderCharts(orders) }
			</ScreenWrapper>
		)
	}

	renderCharts(orders?: any) {
		if( !orders ){
			return <Card>Loading...</Card>
		}

		return (
			<Card>
				<pre>{ JSON.stringify(orders, null, 2) }</pre>
			</Card>
		);
	}

	getDeploymentId() {
		return this.props.router.location.params.id;
	}

	getOrders(deployment?: DBBotDeployment): Orders | undefined {
		if (!deployment) return;
		let { items } = deployment.orders;
		// @ts-ignore
		return items.flatten ? items.flatten() : items;
	}
}