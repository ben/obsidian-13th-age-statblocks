import {
	App,
	MarkdownPostProcessorContext,
	parseYaml,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";
import { StatblockRenderer } from "statblockrenderer";

const srdData = require("monsters.json");

export default class ArchmagePlugin extends Plugin {
	async onload() {
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
		let renderData = { ...yaml };

		if (yaml.monster) {
			const lookupMonster = srdData.find((x) => x.name === yaml.monster);
			if (lookupMonster) {
				renderData = { ...lookupMonster, ...yaml };
			}
		}

		ctx.addChild(new StatblockRenderer(el, renderData));
	}

	onunload() {}
}
