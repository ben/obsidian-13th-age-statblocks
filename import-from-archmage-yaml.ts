import { readFile, writeFile, readdir } from 'fs/promises'
import yaml from 'yaml'

const debug = require('debug')('import')

function stripFoundryMarkup (input?: string): string {
	return (input ?? '')
		.replace(/\[\[(d20)?/g, '') // Remove [[d20 and [[
		.replace(/\]\]/g, '') // Remove ]]
		.replace(/\+\s*(\d+)/g, '+$1') // convert "+ 1" to "+1"
		.replace(/\*(\w+)\*/g, '$1') // convert *word* to word
		.trim()
}

async function doit () {
	// This relies on having the archmage repo cloned at ../archmange, and the packs built

	// Find all the *.yaml files in the archmage/packs/dist directory
	const yamlFiles = await readdir('../archmage/src/packs/src/srd-monsters/')

	const monsters = []
	for (const yamlFilename of yamlFiles) {
		// Parse the yaml file
		const rawData = await readFile(
			`../archmage/src/packs/src/srd-monsters/${yamlFilename}`,
			{
				encoding: 'utf-8'
			}
		)
		const parsed = yaml.parse(rawData)
		debug(`Processing ${parsed.name}`)

		let size = parsed.system.details.size.value
		if (size === '2x') size = 'Double-strength'
		if (size === '3x') size = 'Triple-strength'
		if (size.toLowerCase() === 'normal') size = undefined

		const monster = {
			name: parsed.name,
			level: parsed.system.attributes.level.value,
			size: size,
			tag: parsed.system.details.type.value,
			role: parsed.system.details.role.value || undefined,
			vuln: parsed.system.details.vulnerability.value || undefined,
			ac: parsed.system.attributes.ac.value,
			pd: parsed.system.attributes.pd.value,
			md: parsed.system.attributes.md.value,
			hp: parsed.system.attributes.hp.value,
			initiative: parsed.system.attributes.init.mod,
			attacks: [] as any[],
			traits: [] as any[],
			specials: [] as any[]
		}

		for (const item of parsed.items) {
			if (item.type === 'action') {
				let name = item.name as string
				let tag = undefined
				const m = name.match(/\[(.*)\](.*)/)
				if (m) {
					tag = m[1].trim()
					name = m[2].trim()
				}

				const roll = stripFoundryMarkup(item.system.attack.value)
				// .replace('[[d20', '')
				// .replace(']]', '')
				// .replace(/\+\s*(\d+)/, '+$1')
				// .trim()

				const extras = [] as any[]
				for (const k of ['hit1', 'hit2', 'hit3', 'hit4', 'hit5']) {
					const extraHit = item.system[k]
					if (extraHit?.name) {
						extras.push({
							name: extraHit.name,
							description: stripFoundryMarkup(extraHit.value)
						})
					}
				}

				monster.attacks.push({
					name,
					tag,
					attack: roll,
					hit: stripFoundryMarkup(item.system.hit.value),
					extras
				})
			} else {
				const thing = {
					name: item.name,
					description: stripFoundryMarkup(
						item.system.description.value
					)
				}
				const monsterKey = {
					trait: 'traits',
					nastierSpecial: 'specials'
				}[item.type]
				monster[monsterKey].push(thing)
			}
		}

		monsters.push(monster)
	}

	// Write the results to a file
	await writeFile('monsters.json', JSON.stringify(monsters, null, 2))
}

doit().then(console.log, console.error)
