import { MarkdownRenderChild } from "obsidian";

export class StatblockRenderer extends MarkdownRenderChild {
	statblockEl: HTMLDivElement;

	constructor(containerEl: HTMLElement, private params: any) {
		super(containerEl);

		this.statblockEl = this.containerEl.createDiv({ cls: "statblock-13a" });

		this.statblockEl.createEl("h2", { cls: "sc", text: params.name });

		if (params.blurb) {
			this.statblockEl.createDiv({ cls: "em", text: params.blurb });
		}

		const role = this.statblockEl.createDiv({ cls: "role" });
		role.createSpan({ cls: "em", text: this.roleText });
		if (params.tag) {
			role.createSpan({ cls: "sc", text: ` [${params.tag}]` });
		}

		this.statblockEl.createDiv({
			text: `Initiative: ${bonus(params.initiative)}`,
		});

		for (const attack of params.attacks) {
			this.renderAttack(attack);
		}
		for (const trait of params.traits) {
			this.renderSimpleItem(trait);
		}

		if (params.specials) {
			this.statblockEl.createEl("h4", { text: "Nastier Specials" });
			for (const special of params.specials) {
				this.renderSimpleItem(special)
			}
		}

		const numbers = this.statblockEl.createDiv({ cls: "numbers" });
		const defenses = numbers.createDiv();
		defenses.createDiv({ cls: "bold", text: `AC ${params.ac}` });
		defenses.createDiv({ text: `PD ${params.pd}` });
		defenses.createDiv({ text: `MD ${params.md}` });
		numbers.createDiv({ cls: "bold", text: `HP ${params.hp}` });
		numbers.createDiv("");
	}

	get roleText(): string {
		const ordinalRules = new Intl.PluralRules("en", { type: "ordinal" });
		const suffixes = {
			zero: "th",
			one: "st",
			two: "nd",
			few: "rd",
			other: "th",
			many: "th",
		};
		const suffix = suffixes[ordinalRules.select(this.params.level)];
		const nth = `${this.params.level}${suffix}`;

		return capitalize(
			[
				this.params.size,
				this.params.strength && `${this.params.strength}-strength`,
				`${nth} level`,
				this.params.role,
			].join(" ")
		);
	}

	renderAttack(attack: any) {
		const attackEl = this.statblockEl.createDiv({ cls: "attack" });
		if (attack.type === "special") {
			attackEl.createSpan({ cls: "em", text: "[Special trigger] " });
		}
		const titleParts = [
			attack.type === "ranged" ? "R:" : "",
			attack.type === "close" ? "C:" : "",
			attack.name,
			attack.attack,
			attack.detail ? `(${attack.detail})` : "",
		];
		attackEl.createSpan({ cls: "bold dedent", text: titleParts.join(" ") });
		attackEl.createSpan({ text: ` — ${attack.hit}` });

		for (const extra of attack.extras ?? []) {
			const div = attackEl.createDiv();
			div.createSpan({ cls: "em", text: `${extra.trigger}: ` });
			div.createSpan({ text: extra.result });
		}
	}

	renderSimpleItem(trait: any) {
		const traitEl = this.statblockEl.createDiv();
		traitEl.createSpan({ cls: "em", text: `${trait.name}: ` });
		traitEl.createSpan({ text: trait.description });
	}
}

function capitalize(str: string): string {
	const lower = str.toLowerCase();
	return lower[0].toUpperCase() + lower.slice(1);
}

function bonus(stat: number): string {
	if (stat === 0) return stat.toString();
	return stat > 0 ? `+${stat}` : stat.toString();
}
