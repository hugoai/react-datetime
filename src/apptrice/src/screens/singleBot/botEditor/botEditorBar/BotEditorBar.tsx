import * as React from 'react'
import Button from '../../../../components/button/Button';
import { BacktestConfig } from '../../../botEditor/tools/BotTools';
import ProgressBar from '../../../botEditor/tools/ProgressBar';
import styles from './_BotEditorBar.module.css';
import BotEditorConsolePanel from './console/BotEditorConsolePanel';
import BotEditorConsoleTab from './console/BotEditorConsoleTab';
import ProblemsPanel from './problems/ProblemsPanel';
import ProblemsTab, { CodeProblem } from './problems/ProblemsTab';
import quickStore from '../../../../state/quickStore';
import { Modal, ModalBox } from '../../../../components';
import BtSettings from '../../../../common/btSettings/BtSettings';

interface BotEditorBarProps {
	botId: string,
	codeProblems: CodeProblem[],
	quickStore: typeof quickStore,
	currentBackTesting?: any,
	onRun: (config: BacktestConfig) => void,
	onAbort: () => void
	onHighlightLine: (line:number) => void
}

const tabComponents: {[any:string]: any} = {
	problems: ProblemsTab,
	console: BotEditorConsoleTab
};

const panelComponents: { [any: string]: any } = {
	problems: ProblemsPanel,
	console: BotEditorConsolePanel
}

export default class BotEditorBar extends React.Component<BotEditorBarProps> {
	state = {
		currentTab: 'problems',
		btModalOpen: false
	}

	render() {
		return (
			<div className={styles.container}>
				<div className={styles.tabsBar}>
					<div className={styles.tabs}>
						{this.renderTabs()}
					</div>
					<div className={styles.buttons}>
						{this.renderBt()}
					</div>
				</div>
				<div className={styles.panelBar}>
					{ this.renderPanel() }
				</div>
				{ this.renderBtModal() }
			</div>
		)
	}

	renderTabs(){
		return Object.keys( tabComponents ).map( key => {
			let Tab: any = tabComponents[key];
			return (
				<Tab key={key}
					id={key}
					active={ key === this.state.currentTab }
					onClick={ this._onTabPress }
					problems={this.props.codeProblems }
					quickStore={ this.props.quickStore } />
			);
		})
	}

	renderPanel(){
		let Panel: any = panelComponents[this.state.currentTab];
		return (
			<Panel
				problems={this.props.codeProblems}
				quickStore={this.props.quickStore}
				onHighlightLine={ this.props.onHighlightLine } />
		);
	}

	renderBt() {
		return (
			<div>
				<div>
					{this.renderButton()}
				</div>
				<div>
					{this.renderProgress()}
				</div>
			</div>
		)
	}

	renderButton() {
		if (this.isBtRunning()) {
			return (
				<Button size="s" onClick={this._onAbortBT}>
					Abort
				</Button>
			);
		}
		return (
			<Button size="s" onClick={this._showBtModal}>
				Start backtesting
			</Button>
		)
	}

	renderProgress() {
		if (!this.isBtRunning()) return;

		const { currentBackTesting } = this.props;
		const progress = currentBackTesting.iteration / currentBackTesting.totalIterations * 100;
		return (
			<ProgressBar progress={progress} />
		);
	}

	renderBtModal() {
		return (
			<Modal open={this.state.btModalOpen} onClose={this._hideBtModal}>
				{ () => (
					<ModalBox>
						<BtSettings
							botId={ this.props.botId}
							isRunning={ this.isBtRunning() }
							onRun={ this._onStartPressed }
							onAbort={ this._onAbortBT } />
					</ModalBox>
				)}
			</Modal>
		)
	}


	updatePercentage(field: string, value: string) {
		if (value[value.length - 1] !== '%') {
			this.setState({ [field]: value + '%' });
		}
		else {
			this.setState({ [field]: value });
		}
	}


	isBtRunning(): boolean {
		return this.props.currentBackTesting?.status === 'running' || false;
	}

	_showBtModal = () => {
		this.setState({btModalOpen: true});
	}

	_hideBtModal = () => {
		this.setState({btModalOpen: false});
	}

	_onStartPressed = (config: BacktestConfig) => {
		this._hideBtModal();
		this.props.onRun( config );
	}

	_onAbortBT = () => {
		this.props.onAbort();
	}

	_onTabPress = ( currentTab:string ) => {
		this.setState({currentTab});
	}
}
