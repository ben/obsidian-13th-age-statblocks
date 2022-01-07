import {
	App,
	MarkdownPostProcessorContext,
	parseYaml,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";
import { StatblockRenderer } from "statblockrenderer";

const srdData = require('monsters.json')

interface ArchmageSettings {


	mySetting: string;
}

const DEFAULT_SETTINGS: ArchmageSettings = {
	mySetting: "default",
};

export default class ArchmagePlugin extends Plugin {
	settings: ArchmageSettings;

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		// this.addSettingTab(new SampleSettingTab(this.app, this));

		this.registerMarkdownCodeBlockProcessor(
			"13a",
			this.processMarkdown.bind(this)
		);
	}

	async processMarkdown(
		source: string,
		el: HTMLElement,
		ctx: MarkdownPostProcessorContext
	): Promise<any> {
		const yaml = parseYaml(source);
		let renderData = {...yaml}

		if (yaml.monster) {
			const lookupMonster = srdData.find(x => x.name === yaml.monster)
			if (lookupMonster) {
				renderData = {...lookupMonster, ...yaml}
			}
		}

		ctx.addChild(new StatblockRenderer(el, renderData));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: ArchmagePlugin;

	constructor(app: App, plugin: ArchmagePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Settings for my awesome plugin." });

		new Setting(containerEl)
			.setName("Setting #1")
			.setDesc("It's a secret")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.mySetting)
					.onChange(async (value) => {
						console.log("Secret: " + value);
						this.plugin.settings.mySetting = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
