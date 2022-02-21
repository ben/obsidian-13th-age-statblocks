import { readFile, writeFile } from "fs/promises";

const debug = require("debug")("import");

async function doit() {
	// This relies on having the archmage repo cloned at ../archmange, and the packs built
	const rawData = await readFile("../archmage/packs/dist/srd-monsters.db", {
		encoding: "utf-8",
	});
	const lines = rawData.toString().split("\n");

	const monsters = [];
	for (const json of lines) {
		if (json.trim() === '') continue
		const parsed = JSON.parse(json);
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
		  role: parsed.data.details.role.value || undefined,
		  vuln: parsed.data.details.vulnerability.value || undefined,
		  ac: parsed.data.attributes.ac.value,
		  pd: parsed.data.attributes.pd.value,
		  md: parsed.data.attributes.md.value,
		  hp: parsed.data.attributes.hp.value,
		  initiative: parsed.data.attributes.init.mod,
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

doit().then(console.log, console.error);
