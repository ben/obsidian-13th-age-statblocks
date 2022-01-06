import {
	App,
	Editor,
	MarkdownPostProcessorContext,
	MarkdownRenderChild,
	MarkdownView,
	Modal,
	Notice,
	parseYaml,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: "default",
};

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

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
		console.log(yaml);
		ctx.addChild(new StatblockRenderer(el, yaml));
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

class StatblockRenderer extends MarkdownRenderChild {
	statblockEl: HTMLDivElement;

	constructor(containerEl: HTMLElement, private params: any) {
		super(containerEl);

		this.statblockEl = this.containerEl.createDiv({
			cls: "statblock-13a",
		});

		const heading = this.statblockEl.createDiv({ cls: "heading" });
		heading.createSpan({ text: params.name });
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
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
