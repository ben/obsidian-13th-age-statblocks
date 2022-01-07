import { writeFile } from "fs/promises";
import * as https from "https";

const debug = require("debug")("import");

async function doit() {
	const remoteData = await fetchJson();

	const monsters = [];
	for (const parsed of remoteData) {
		debug(`Processing ${parsed.name}`);

		let size = parsed.data.details.size.value;
		if (size === "2x") size = "Double-strength";
		if (size === "3x") size = "Triple-strength";
		if (size.toLowerCase() === "normal") size = undefined;

		const monster = {
			name: parsed.name,
			level: parsed.data.attributes.level.value,
			size,
			tag: parsed.data.details.type.value,
			vulnerability: parsed.data.details.vulnerability.value || undefined,
			ac: parsed.data.attributes.ac.value,
			pd: parsed.data.attributes.pd.value,
			md: parsed.data.attributes.md.value,
			hp: parsed.data.attributes.hp.value,
			initiative: parsed.data.attributes.init.modifier,
			attacks: [] as any[],
			traits: [] as any[],
			specials: [] as any[],
		};

		for (const item of parsed.items) {
			if (item.type === "action") {
				let name = item.name as string;
				let tag = undefined;
				const m = name.match(/\[(.*)\](.*)/);
				if (m) {
					tag = m[1].trim();
					name = m[2].trim();
				}

				const roll = item.data.attack.value
					.replace("[[d20", "")
					.replace("]]", "")
					.replace(/\+\s*(\d+)/, "+$1")
					.trim();

				const extras = [] as any[];
				for (const k of ["hit1", "hit2", "hit3", "hit4", "hit5"]) {
					const extraHit = item.data[k];
					if (extraHit?.name) {
						extras.push({
							name: extraHit.name,
							description: extraHit.value,
						});
					}
				}

				monster.attacks.push({
					name,
					tag,
					attack: roll,
					hit: item.data.hit.value,
					extras,
				});
			} else {
				const thing = {
					name: item.name,
					description: item.data.description.value,
				};
				const monsterKey = {
					trait: "traits",
					nastierSpecial: "specials",
				}[item.type];
				monster[monsterKey].push(thing);
			}
		}

		monsters.push(monster);
	}

	// Write the results to a file
	await writeFile("monsters.json", JSON.stringify(monsters, null, 2));
}

function fetchJson(): Promise<any> {
	return new Promise((resolve, reject) => {
		const options = {
			hostname: "raw.githubusercontent.com",
			path: "/Mageflame/Toolkit13/master/monster-scraper/monsters.json",
			method: "GET",
		};
		const req = https.request(options, (res) => {
			let data = "";
			res.on("data", (d) => {
				data += d;
			});
			res.on("end", () => {
				resolve(JSON.parse(data));
			});
		});
		req.on("error", reject);
		req.end();
	});
}

doit().then(console.log, console.error);
